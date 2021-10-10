import { XMLHttpRequest } from 'xmlhttprequest';
import * as fs from 'fs';
import {
  iconPhraseToInGameWeather,
  IconPhrase,
  WINDY,
} from './resources/game-info';
import apiKeys from './resources/api-keys';
import { LocationId, locationIdToLocation } from './resources/locations';
import { extname } from 'path';
import https from 'https';
import axios from 'axios';

const credential = process.env.CREDENTIAL ?? '';

const BASE_URL =
  'http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/';
const MI_TO_KM = 1.609;

const BASE_SERVER_URL = 'https://pokemon-go-forecast-server.herokuapp.com';

let keyCounter = 0;

export const nianticFetchingHours = [2, 17];
const extraFetchingHours = [3, 4, 5, 6, 7];
const fetchingHours = nianticFetchingHours.concat(extraFetchingHours);

export async function readLocalFile(endpoint: string): Promise<any> {
  try {
    return (await axios.get(BASE_SERVER_URL + endpoint)).data;
  } catch (err) {
    console.error(err);
    return '[]';
  }
}

export async function isDBAvailable(): Promise<boolean> {
  try {
    return await (axios
      .get(BASE_SERVER_URL + '/weather')
      .then(res =>  res.status === 200));
  } catch (error) {
    return false;
  }
}

export async function writeToFile(endpoint: string, data: string, id?: number | string) {
  await axios
    .post(BASE_SERVER_URL + endpoint, {id, data}, {
      headers: {
        'Content-Type': 'application/json',
        credential,
      },
    })
    .then(res => console.log(`Written to database (${endpoint}): ${res.status}`))
    .catch(error => console.error(error.response.status, error.response.statusText));
}

export function getFileName(id: string): string {
  return `weather_${id}.json`;
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

export function extractTimeFromRawDatum(
  datum: RawDatum,
): {
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
