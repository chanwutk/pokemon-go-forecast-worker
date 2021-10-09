import { locationIdToLocation } from './resources/locations';
import { writeToFile } from './utils';
import recordWeather from './recordWeather';
import hourlyRepeat from './hourlyRepeat';

writeToFile('/clear-records', '');
const INITIAL_WEATHER_DATA = JSON.stringify(new Array(24).fill(null));
for (const id in locationIdToLocation) {
  writeToFile('/modify-raw', INITIAL_WEATHER_DATA, id);
}

hourlyRepeat(recordWeather)();
