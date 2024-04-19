import {
  iconPhraseToInGameWeather,
  IconPhrase,
  WINDY,
} from './resources/game-info';
import apiKeys from './resources/api-keys';
import { LocationId, locationIdToEngLocation } from './resources/locations';
import fs from 'fs';
import { execSync } from 'child_process';
import * as path from 'path';
import { maskKey } from './mask-key';

const BASE_URL =
  'http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/';
const MI_TO_KM = 1.609;

const GIT_REPO = 'git@github.com:chanwutk/pokemon-go-forecast-data.git';
if (!('PGF_DATA' in process.env)) {
  throw new Error('PGF_DATA not in env');
}
const DATA_DIR = process.env.PGF_DATA ?? './pokemon-go-forecast-data';

const LOG_SIZE = 2000;

let keyCounter = 0;

export const nianticFetchingHours = [2, 17];
const extraFetchingHours = [3, 4, 5, 6, 7];
const fetchingHours = nianticFetchingHours.concat(extraFetchingHours);

export function initDB() {
  console.log('initializing db');

  if (!fs.existsSync(DATA_DIR)) {
    try {
      execSync(`git clone ${GIT_REPO} ${DATA_DIR}`);
    } catch (e) {
      console.error('git error: clone');
      throw e;
    }
  }
}

export function readFromDB(filename: string): any {
  if (!fs.existsSync(path.join(DATA_DIR, filename))) {
    throw new Error('file does not exist');
  }
  const content = fs.readFileSync(path.join(DATA_DIR, filename)).toString();

  console.log(`   Data fetched: ${filename}`);
  try {
    return JSON.parse(content);
  } catch (e) {
    if (!(e instanceof SyntaxError)) {
      throw e;
    }
    return content;
  }
}

export function pushData() {
  updateData('force push', () => null, true);
}

function updateData(
  description: string,
  update: () => any,
  push: boolean = true,
) {
  if (!fs.existsSync(DATA_DIR)) {
    throw new Error('data directory does not exist');
  }

  update();

  let log: string[];
  if (!fs.existsSync(path.join(DATA_DIR, 'updates.log'))) {
    log = [];
  } else {
    log = fs
      .readFileSync(path.join(DATA_DIR, 'updates.log'))
      .toString()
      .split('\n');
  }

  let pushStatus: string = '[UPDATE]';
  if (push) {
    pushStatus = '  [PUSH]';
  }

  log.unshift(`${new Date().toString()} -- ${pushStatus} ${description}`);
  log = log.slice(0, LOG_SIZE);

  fs.writeFileSync(path.join(DATA_DIR, 'updates.log'), log.join('\n'));

  function repeeatPush(retryCount: number) {
    if (!push || retryCount >= 5) {
      return;
    }

    try {
      if (retryCount >= 2) {
        const data_tmp = DATA_DIR + '_tmp';
        fs.mkdirSync(data_tmp);
        execSync(`mv ${path.join(DATA_DIR, '*.json')} ${data_tmp}`);
        execSync(`mv ${path.join(DATA_DIR, '*.log')} ${data_tmp}`);
        fs.rmdirSync(DATA_DIR, {recursive: true});

        initDB();
        execSync(`mv ${path.join(data_tmp, '*.json')} ${DATA_DIR}`);
        execSync(`mv ${path.join(data_tmp, '*.log')} ${DATA_DIR}`);
        fs.rmdirSync(data_tmp, {recursive: true});
      }

      execSync(
        [
          'git add --all',
          'git commit --amend -m "update data"',
          'git push --force',
        ].join(' && '),
        { cwd: DATA_DIR },
      );
      push = false;
    } catch (e) {
      console.error();
      console.error(
        '----------------------- Push Error -----------------------',
      );
      console.error(e);
      console.error(
        '----------------------------------------------------------',
      );
      console.error();
      console.error();
      console.error();
    }

    setTimeout(repeeatPush, 5 * 1000, retryCount + 1);
  }

  repeeatPush(0);
}

export function clearRecords(push: boolean = true) {
  updateData(
    'clear records',
    () => execSync("find . -name '*.pgf*' -type f -delete", { cwd: DATA_DIR }),
    push,
  );
}

export function writeToDB(
  filename: string,
  data: string,
  push: boolean = true,
) {
  updateData(
    `write to db (${filename})`,
    () => fs.writeFileSync(path.join(DATA_DIR, filename), data),
    push,
  );
}

function isRawDatum(d: any): d is RawDatum {
  try {
    if (typeof d.DateTime !== 'string') {
      return false;
    }

    if (typeof d.IconPhrase !== 'string') {
      return false;
    }

    if (typeof d.Wind.Speed.Value !== 'number') {
      return false;
    }

    if (typeof d.WindGust.Speed.Value !== 'number') {
      return false;
    }

    if (typeof d.HasPrecipitation !== 'boolean') {
      return false;
    }

    return true;
  } catch (e) {
    return false;
  }
}

function areRawData(dd: any): dd is RawDatum[] {
  try {
    if (!Array.isArray(dd)) {
      return false;
    }

    return dd.every(isRawDatum);
  } catch (e) {
    return false;
  }
}

export async function fetchWeather(
  locationId: LocationId,
): Promise<RawDatum[]> {
  try {
    const url = `${BASE_URL}${locationId}?apikey=${apiKeys[keyCounter]}&details=true`;
    keyCounter = (keyCounter + 1) % apiKeys.length;

    const response = await fetch(url);
    const jsonOutput = (await response.json()) as RawDatum[];
    if (!areRawData(jsonOutput)) {
      throw new Error(`Malform response: ${jsonOutput}`);
    }

    const urls = url.split('?');
    console.log(`   URL: ${urls[0]}`);
    if (urls.length > 1) {
      urls.slice(1).forEach(u => {
        u.split('&').forEach((kv, i, kvs) => {
          const [k, v] = kv.split('=');
          console.log(
            `        ${k}=${k === 'apikey' ? maskKey(v) : v}${
              i === kvs.length - 1 ? '' : '&'
            }`,
          );
        });
      });
    }
    console.log(`   Location fetched: ${locationIdToEngLocation[locationId]}`);
    console.log(
      `   Reponse size (# of chars): ${JSON.stringify(jsonOutput).length}`,
    );

    return jsonOutput;
  } catch (err) {
    console.log(`   fetch error: ${err}`);
    throw new Error(`fetch error: ${err}`);
  }
}

export function isHourToCheck(hour: number): boolean {
  return fetchingHours.includes(hour);
}

export function extractTimeFromRawDatum(datum: RawDatum): {
  time: number;
  datum: RawDatum;
} {
  return {
    time: Number(datum.DateTime.split('T')[1].split(':')[0]),
    datum: datum,
  };
}

function translateWeather(datum: RawDatum): string {
  const iconPhrase: IconPhrase = datum.IconPhrase as IconPhrase;
  if (iconPhraseToInGameWeather[iconPhrase]) {
    const windSpeed: number = datum.Wind.Speed.Value * MI_TO_KM;
    const gustSpeed: number = datum.WindGust.Speed.Value * MI_TO_KM;
    return (windSpeed >= 24.1 || windSpeed + gustSpeed >= 55) &&
      !datum.HasPrecipitation
      ? WINDY
      : iconPhraseToInGameWeather[iconPhrase];
  } else {
    console.log(`Phrase not matched (${iconPhrase})`);
    return `not-matched (${iconPhrase})`;
  }
}

export function translateRawData(data: (RawDatum | null)[]): (string | null)[] {
  return data.map((d: RawDatum | null): string | null => {
    return d !== null ? translateWeather(d) : null;
  });
}

export function logMessage(hour: number, message: string): string {
  return `${hour < 10 ? ' ' : ''}${hour}:00 : ${message}`;
}
