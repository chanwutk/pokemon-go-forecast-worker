import { locationIdToLocation } from './resources/locations';
import { getFileName, writeToFile, readLocalFile } from './utils';
import recordWeather from './recordWeather';
import express, { Request, Response } from 'express';

const ONE_MINUTE = 1000 * 60;
const RAW_PATH = './raw_weather/';

// ----------------- retrieve weather data from accuweather ----------------- //
const INITIAL_WEATHER_DATA: string = JSON.stringify(new Array(24).fill(null));
for (const id in locationIdToLocation) {
  const fileName: string = getFileName(id);
  writeToFile(RAW_PATH + fileName, INITIAL_WEATHER_DATA);
}

recordWeather();
setInterval(recordWeather, ONE_MINUTE);

// -------------------------------- make API -------------------------------- //
const app = express();
const port = 8080;

app.get('/', (req: Request, res: Response) => {
  res.send(readLocalFile('weather.json'));
});

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
