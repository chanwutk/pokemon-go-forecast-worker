import {locationIdToLocation, LocationId} from './resources/locations';
import {inGameWeatherToType, InGameWeather} from './resources/game-info';
import { isHourToCheck, logMessage, getFileName, readLocalFile, fetchWeather, nianticFetchingHours, extractTime, writeToFile, translateRawData } from './utils';

const ONE_MINUTE = 1000 * 60;
const RAW_PATH = './raw_weather/';
const TRANSLATED_PATH = './translated_weather/';
const BKK_TZ_OFFSET = 7;

let currentHour = -1;

function recordWeather() {
  const date: Date = new Date();
  const offset: number = date.getTimezoneOffset() / 60;
  const hour: number = (date.getHours() + offset + BKK_TZ_OFFSET) % 24;

  if (currentHour !== hour && date.getMinutes() > 0) {
    currentHour = hour;
    if (isHourToCheck(hour)) {
      console.log(logMessage(hour, 'fetching data'));

      const outputData: OutputDatum[] = [];
      for (const id in locationIdToLocation) {
        const fileName: string = getFileName(id);
        const currentData: RawDatum[] = JSON.parse(readLocalFile(RAW_PATH + fileName));

        let newWeather: RawDatum[];
        try {
          newWeather = fetchWeather(id as LocationId);
        } catch (err) {
          currentHour = -1;
          return;
        }

        if (nianticFetchingHours.includes(hour)) {
          for (let i = 0; i < currentData.length; i++) {
            if (i !== hour && i !== hour + 1) currentData[i] = null;
          }
        }

        for (let i = 1; i < newWeather.length; i++) {
          // TODO: remove data
          const { time, data } = extractTime(newWeather[i]);
          if (!nianticFetchingHours.includes(hour)) {
            if (currentData[time] === null) currentData[time] = data;
          } else currentData[time] = data;
        }

        writeToFile(RAW_PATH + fileName, JSON.stringify(currentData));
        const translatedData: (string | null)[] = translateRawData(currentData);
        for (const time in translatedData) {
          const weather: string | null = translatedData[time];
          const order: number = (Number(time) + 24 - hour) % 24;
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

      const records: OutputDatum[] = JSON.parse(readLocalFile(TRANSLATED_PATH + 'weather.json'));
      let currentOrder: number = 0;
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
}

const INITIAL_WEATHER_DATA: string = JSON.stringify(new Array(24).fill(null));
for (const id in locationIdToLocation) {
  const fileName: string = getFileName(id);
  writeToFile(RAW_PATH + fileName, INITIAL_WEATHER_DATA);
}

recordWeather();
setInterval(recordWeather, ONE_MINUTE);
