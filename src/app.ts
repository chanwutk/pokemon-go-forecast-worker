import { locationIdToLocation } from './resources/locations';
import { isDBAvailable, writeToFile } from './utils';
import recordWeather from './recordWeather';
import hourlyRepeat from './hourlyRepeat';

const INITIAL_WEATHER_DATA = JSON.stringify(new Array(24).fill(null));

async function wait() {
  if (await isDBAvailable()) {
    start();
  } else {
    setTimeout(wait, 1000);
  }
}

async function start() {
  await writeToFile('/clear-records', '');
  for (const id in locationIdToLocation) {
    await writeToFile('/modify-raw', INITIAL_WEATHER_DATA, id);
  }

  hourlyRepeat(recordWeather)();
}

wait();