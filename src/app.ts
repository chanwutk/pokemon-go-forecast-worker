import { locationIdToLocation } from './resources/locations';
import { getFileName, writeToFile, readLocalFile } from './utils';
import recordWeather, { RAW_PATH } from './recordWeather';
import express, { Request, Response } from 'express';
import { NextFunction } from 'connect';
import { join } from 'path';
import { TRANSLATED_WEATHER } from './recordWeather';
import hourlyRepeat from './hourlyRepeat';

// ----------------- retrieve weather data from accuweather ----------------- //
const INITIAL_WEATHER_DATA: null[] = new Array(24).fill(null);
for (const id in locationIdToLocation) {
  const fileName: string = getFileName(id);
  writeToFile(join(RAW_PATH, fileName), INITIAL_WEATHER_DATA);
}

hourlyRepeat(recordWeather)();

// -------------------------------- make API -------------------------------- //
const app = express();
const port = 8000;

app.use(function (req: Request, res: Response, next: NextFunction) {
  // TODO: allow only from github page
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});

app.get('/', (req: Request, res: Response) => {
  res.send(readLocalFile(TRANSLATED_WEATHER));
});

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
