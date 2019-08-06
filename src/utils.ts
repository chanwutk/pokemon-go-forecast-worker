import { XMLHttpRequest } from 'xmlhttprequest-ts';
import * as fs from 'fs';
import {iconPhraseToInGameWeather, IconPhrase, WINDY} from './resources/game-info';
import apiKeys from './resources/api-keys';
import { LocationId, locationIdToLocation } from './resources/locations';

const BASE_URL = 'http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/';
const MI_TO_KM = 1.609;

let keyCounter = 0;

export const nianticFetchingHours = [2, 17];
const extraFetchingHours = [3, 4, 5, 6, 7];
const fetchingHours = nianticFetchingHours.concat(extraFetchingHours);

export function readLocalFile(url: string): string {
  try {
    return fs.readFileSync(url).toString();
  } catch (err) {
    return '[]';
  }
}

export function fetchWeather(locationId: LocationId): RawDatum[] {
  try {
    let url = `${BASE_URL}${locationId}?apikey=${apiKeys[keyCounter]}&details=true`;
    keyCounter = (keyCounter + 1) % apiKeys.length;
    let xhttp = new XMLHttpRequest();
    let jsonOutput: RawDatum[] = [];

    xhttp.onreadystatechange = () => {
      if (xhttp.readyState === 4 && (xhttp.status === 200 || xhttp.status === 0))
        jsonOutput = JSON.parse(xhttp.responseText);
    };
    xhttp.open('GET', url, false);
    xhttp.send();

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

export function extractTime(weatherData: RawDatum): {
  time: number;
  data: RawDatum;
} {
  return {
    time: Number(weatherData.DateTime.split('T')[1].split(':')[0]),
    data: weatherData
  };
}

export function getFileName(id: string): string {
  return `weather_${id}.json`;
}

export function writeToFile(fileName: string, content: string) {
  fs.writeFileSync(fileName, content);
}

export function translateWeather(data: RawDatum): string {
  const iconPhrase: IconPhrase = <IconPhrase>data.IconPhrase;
  if (iconPhraseToInGameWeather[iconPhrase]) {
    const windSpeed: number = data.Wind.Speed.Value * MI_TO_KM;
    const gustSpeed: number = data.WindGust.Speed.Value * MI_TO_KM;
    return (windSpeed >= 24.1 || windSpeed + gustSpeed >= 55) && !data.HasPrecipitation
      ? WINDY
      : iconPhraseToInGameWeather[iconPhrase];
  } else {
    console.log(`Phrase not matched (${iconPhrase})`);
    return `not-matched (${iconPhrase})`;
  }
}

export function translateRawData(data: RawDatum[]): (string | null)[] {
  return data.map((d: RawDatum): string | null => {
    return d !== null ? translateWeather(d) : null;
  });
}

export function logMessage(hour: number, message: string): string {
  return `${(hour < 10 ? ' ' : '')}${hour}:00 : ${message}`;
}