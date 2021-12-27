import { locationIdToLocation } from './resources/locations';
import { isDBAvailable, writeToDB } from './utils';
import recordWeather from './record-weather';
import hourlyRepeat from './hourly-repeat';

const INITIAL_WEATHER_DATA = JSON.stringify(new Array(24).fill(null));

async function wait() {
  if (await isDBAvailable()) {
    start();
  } else {
    setTimeout(wait, 1000);
  }
}

async function start() {
  await writeToDB('/clear-records', '');
  for (const id in locationIdToLocation) {
    await writeToDB('/modify-raw', INITIAL_WEATHER_DATA, id);
  }

  hourlyRepeat(recordWeather)();
}

wait();
