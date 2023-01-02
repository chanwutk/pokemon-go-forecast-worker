import { locationIdToLocation } from './resources/locations';
import { clearRecords, initDB, pushData, writeToDB } from './utils';
import recordWeather from './record-weather';
import hourlyRepeat from './hourly-repeat';

const INITIAL_WEATHER_DATA = JSON.stringify(new Array(24).fill(null));

console.log('server started');

initDB();
clearRecords();

for (const id in locationIdToLocation) {
  writeToDB(`raw${id}.pgf.json`, INITIAL_WEATHER_DATA, false);
}
pushData();

hourlyRepeat(recordWeather)();
