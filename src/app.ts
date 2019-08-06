import { XMLHttpRequest } from 'xmlhttprequest-ts';
import * as fs from 'fs';

import {locationIdToLocation, LocationId} from './resources/locations';
import {inGameWeatherToType, InGameWeather, iconPhraseToInGameWeather, IconPhrase, WINDY} from './resources/game-info';
import apiKeys from './resources/api-keys';

const BASE_URL = 'http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/';
const ONE_MINUTE = 1000 * 60;
const RAW_PATH = './raw_weather/';
const TRANSLATED_PATH = './translated_weather/';
const MI_TO_KM = 1.609;
const BKK_TZ_OFFSET = 7;

let currentHour = -1;
let keyCounter = 0;

function readLocalFile(url: string): string {
  try {
    return fs.readFileSync(url).toString();
  } catch (err) {
    return '[]';
  }
}

function fetchWeather(locationId: LocationId): any[] | null {
  try {
    let url = `${BASE_URL}${locationId}?apikey=${apiKeys[keyCounter]}&details=true`;
    keyCounter = (keyCounter + 1) % apiKeys.length;
    let xhttp = new XMLHttpRequest();
    let jsonOutput: any[] = [];

    xhttp.onreadystatechange = () => {
      if (xhttp.readyState === 4 && (xhttp.status === 200 || xhttp.status === 0))
        jsonOutput = JSON.parse(xhttp.responseText);
    };
    xhttp.open('GET', url, false);
    xhttp.send();

    console.log('   Location fetched: ' + locationIdToLocation[locationId]);

    return jsonOutput;
  } catch (err) {
    console.log('   fetch error:' + err);
    return null;
  }
}

const nianticFetchingHours = [2, 17];
const extraFetchingHours = [3, 4, 5, 6, 7];
const fetchingHours = nianticFetchingHours.concat(extraFetchingHours);
function isHourToCheck(hour: number): boolean {
  return fetchingHours.includes(hour);
}

function extractTime(weatherData: any): {
  time: number;
  data: any;
} {
  let time = Number(weatherData.DateTime.split('T')[1].split(':')[0]);
  return { time, data: weatherData };
}

function getFileName(id: string): string {
  return `weather_${id}.json`;
}

function writeToFile(fileName: string, content: string) {
  fs.writeFileSync(fileName, content);
}

function translateWeather(data: any): string {
  const iconPhrase = data.IconPhrase as IconPhrase;
  if (iconPhraseToInGameWeather[iconPhrase]) {
    const windSpeed = data.Wind.Speed.Value * MI_TO_KM;
    const gustSpeed = data.WindGust.Speed.Value * MI_TO_KM;
    return (windSpeed >= 24.1 || windSpeed + gustSpeed >= 55) && !data.HasPrecipitation
      ? WINDY
      : iconPhraseToInGameWeather[iconPhrase];
  } else {
    console.log(`Phrase not matched (${iconPhrase})`);
    return `not-matched (${iconPhrase})`;
  }
}

function translateRawData(data: any): string[] {
  return data.map((d: any): string | null => {
    return d !== null ? translateWeather(d) : null;
  });
}

function logMessage(hour: number, message: string): string {
  return `${(hour < 10 ? ' ' : '')}${hour}:00 : ${message}`;
}

function recordWeather() {
  let date = new Date();
  let offset = date.getTimezoneOffset() / 60;
  let hour = (date.getHours() + offset + BKK_TZ_OFFSET) % 24;

  if (currentHour !== hour && date.getMinutes() > 0) {
    currentHour = hour;
    if (isHourToCheck(hour)) {
      console.log(logMessage(hour, 'fetching data'));

      let outputData = [];
      for (const id in locationIdToLocation) {
        const fileName = getFileName(id);
        let currentData = JSON.parse(readLocalFile(RAW_PATH + fileName));
        let newWeather = fetchWeather(id as LocationId);
        if (newWeather === null) {
          currentHour = -1;
          return;
        }

        if (nianticFetchingHours.includes(hour)) {
          for (let i = 0; i < currentData.length; i++) {
            if (i !== hour && i !== hour + 1) currentData[i] = null;
          }
        }

        for (let i = 1; i < newWeather.length; i++) {
          const { time, data } = extractTime(newWeather[i]);
          if (!nianticFetchingHours.includes(hour)) {
            if (currentData[time] === null) currentData[time] = data;
          } else currentData[time] = data;
        }

        writeToFile(RAW_PATH + fileName, JSON.stringify(currentData));
        const translatedData = translateRawData(currentData);
        for (const time in translatedData) {
          const weather = translatedData[time];
          const order = (Number(time) + 24 - hour) % 24;
          if (order <= 12) {
            outputData.push({
              time: Number(time),
              city: locationIdToLocation[id as LocationId],
              weather,
              types: inGameWeatherToType[weather as InGameWeather],
              order,
            });
          }
        }
      }

      writeToFile(TRANSLATED_PATH + 'weather.json', JSON.stringify(outputData));
      console.log(logMessage(hour, 'data recorded'));
      console.log();
    } else {
      console.log(logMessage(hour, 'update records'));

      const records = JSON.parse(readLocalFile(TRANSLATED_PATH + 'weather.json'));
      let currentOrder;
      for (const record of records) {
        if (hour === record.time) {
          currentOrder = record.order;
          break;
        }
      }

      for (const record of records) {
        if (record.order < currentOrder) record.weather = null;
      }

      writeToFile(TRANSLATED_PATH + 'weather.json', JSON.stringify(records));
      console.log(logMessage(hour, 'records updated'));
      console.log();
    }
  }
};

const INITIAL_WEATHER_DATA = JSON.stringify(new Array(24).fill(null));
for (const id in locationIdToLocation) {
  const fileName = getFileName(id);
  writeToFile(RAW_PATH + fileName, INITIAL_WEATHER_DATA);
}

recordWeather();
setInterval(recordWeather, ONE_MINUTE);
