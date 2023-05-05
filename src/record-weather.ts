import { isHourToCheck } from './utils';
import { join } from 'path';
import { addNewRecords } from './add-new-records';
import { removeOutdatedRecords } from './remove-outdated-records';
import { currentHour, setCurrentHour } from './current-hour';

export const RAW_PATH = './raw_weather/';
export const TRANSLATED_PATH = './translated_weather/';
export const TRANSLATED_WEATHER = join(TRANSLATED_PATH, 'weather.pgf.json');
const BKK_TZ_OFFSET = 7;

export default async function recordWeather() {
  const date: Date = new Date();
  const offset: number = date.getTimezoneOffset() / 60;
  const hour: number = (date.getHours() + offset + BKK_TZ_OFFSET) % 24;
  console.log('Repeat at', date.toString());

  if (currentHour !== hour) {
    setCurrentHour(hour);
    try {
      await (isHourToCheck(hour) ? addNewRecords : removeOutdatedRecords)(hour);
    } catch (e) {
      console.error();
      console.error();
      console.error();
      console.error('------------------------------ ERROR ------------------------------');
      console.error(e);
      console.error();
      console.error();
      console.error();
    }
  }
}
