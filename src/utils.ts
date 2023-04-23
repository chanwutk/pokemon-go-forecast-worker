import { XMLHttpRequest } from 'xmlhttprequest';
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

  if (push) {
    execSync('git add -A', { cwd: DATA_DIR });
    execSync('git commit --amend -m "update data"', { cwd: DATA_DIR });
    execSync('git push -f', { cwd: DATA_DIR });
  }
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

export function fetchWeather(locationId: LocationId): RawDatum[] {
  try {
    const url = `${BASE_URL}${locationId}?apikey=${apiKeys[keyCounter]}&details=true`;
    keyCounter = (keyCounter + 1) % apiKeys.length;
    const xhttp = new XMLHttpRequest();

    xhttp.open('GET', url, false);
    xhttp.send();
    const responseText = xhttp.responseText;
    const jsonOutput = JSON.parse(responseText) as RawDatum[];

    console.log(`   Location fetched: ${locationIdToEngLocation[locationId]}`);
    console.log(`   Reponse size (# of chars): ${responseText.length}`);

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
