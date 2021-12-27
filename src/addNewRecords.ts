import { locationIdToLocation, LocationId } from './resources/locations';
import { inGameWeatherToType, InGameWeather } from './resources/game-info';
import {
  logMessage,
  getFromDB,
  fetchWeather,
  nianticFetchingHours,
  extractTimeFromRawDatum,
  writeToDB,
  translateRawData,
} from './utils';
import { currentHour } from './recordWeather';

export async function addNewRecords(hour: number) {
  console.log(logMessage(hour, 'fetching data'));

  const outputData: OutputDatum[] = [];
  for (const id in locationIdToLocation) {
    const currentData: (RawDatum | null)[] = (await getFromDB(
      '/raw?id=' + id,
    )) as (RawDatum | null)[];

    try {
      const newWeather: RawDatum[] = fetchWeather(id as LocationId);
      if (nianticFetchingHours.includes(hour)) {
        for (let i = 0; i < currentData.length; i++) {
          if (i !== hour && i !== hour + 1) currentData[i] = null;
        }
      }

      for (let i = 1; i < newWeather.length; i++) {
        // TODO: remove data
        const { time, datum } = extractTimeFromRawDatum(newWeather[i]);
        if (!nianticFetchingHours.includes(hour)) {
          if (currentData[time] === null) currentData[time] = datum;
        } else currentData[time] = datum;
      }

      await writeToDB('/modify-raw', JSON.stringify(currentData), id);
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
    } catch (err) {
      currentHour = -1;
      return;
    }
  }
  await writeToDB('/modify-weather', JSON.stringify(outputData));
  console.log(logMessage(hour, 'data recorded'));
  console.log();
}
