import { locationIdToLocation } from './resources/locations';
import { clearRecords as clearDB, writeToDB } from './utils';
import recordWeather from './record-weather';
import hourlyRepeat from './hourly-repeat';

const INITIAL_WEATHER_DATA = JSON.stringify(new Array(24).fill(null));

async function start() {
  clearDB();
  for (const id in locationIdToLocation) {
    writeToDB(`raw${id}.json`, INITIAL_WEATHER_DATA);
  }

  hourlyRepeat(recordWeather)();
}

start();
