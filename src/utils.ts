import { XMLHttpRequest } from 'xmlhttprequest';
import {
  iconPhraseToInGameWeather,
  IconPhrase,
  WINDY,
} from './resources/game-info';
import apiKeys from './resources/api-keys';
import { LocationId, locationIdToLocation } from './resources/locations';
import fs from 'fs';
import { execSync } from 'child_process';

const BASE_URL =
  'http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/';
const MI_TO_KM = 1.609;

const BASE_DATA_URL = 'https://raw.githubusercontent.com/chanwutk/pokemon-go-forecast/data/';
const DATA_DIR = '../pokemon-go-forecast-data/';

let keyCounter = 0;

export const nianticFetchingHours = [2, 17];
const extraFetchingHours = [3, 4, 5, 6, 7];
const fetchingHours = nianticFetchingHours.concat(extraFetchingHours);

export function getFromDB(endpoint: string): any {
  const url = `${BASE_DATA_URL}${endpoint}`;
  const xhttp = new XMLHttpRequest();

  xhttp.open('GET', url, false);
  xhttp.send();

  console.log(`   Data fetched: ${endpoint}`);
  return JSON.parse(xhttp.responseText)
}

function updateData(update: () => any) {
  if (!fs.existsSync(DATA_DIR)) {
    execSync(`git clone git@github.com:chanwutk/pokemon-go-forecast-data.git ${DATA_DIR}`);
  }
  execSync('git pull', { cwd: DATA_DIR });
  update();
  execSync('git add -A && git commit --amend -m "update data" && git push -f', { cwd: DATA_DIR });
}

export function clearRecords() {
  updateData(() => execSync("find . -name '*.pgf.json' -type f -delete", { cwd: DATA_DIR }));
}

export function writeToDB(
  filename: string,
  data: string,
) {
  updateData(() => fs.writeFileSync(DATA_DIR + filename, data));
}

export function fetchWeather(locationId: LocationId): RawDatum[] {
  try {
    let url = `${BASE_URL}${locationId}?apikey=${apiKeys[keyCounter]}&details=true`;
    keyCounter = (keyCounter + 1) % apiKeys.length;
    let xhttp = new XMLHttpRequest();
    let jsonOutput: RawDatum[] = [];

    xhttp.open('GET', url, false);
    xhttp.send();
    jsonOutput = JSON.parse(xhttp.responseText) as RawDatum[];

    console.log(`   Location fetched: ${locationIdToLocation[locationId]}`);

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
