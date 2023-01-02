import { locationIdToLocation, LocationId } from './resources/locations';
import { inGameWeatherToType, InGameWeather } from './resources/game-info';
import {
  logMessage,
  readFromDB,
  fetchWeather,
  nianticFetchingHours,
  extractTimeFromRawDatum,
  writeToDB,
  translateRawData,
} from './utils';
import { setCurrentHour } from './current-hour';

async function _addNewRecord(hour: number, id: string) {
  let currentData: (RawDatum | null)[];
  const outputData: OutputDatum[] = [];
  try {
    currentData = readFromDB(`raw${id}.pgf.json`) as (RawDatum | null)[];
    console.log(logMessage(hour, 'read data'));
  } catch {
    currentData = new Array(24).fill(null);
    console.log(logMessage(hour, 'empty data'));
  }

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

    writeToDB(`raw${id}.pgf.json`, JSON.stringify(currentData, null, 2), false);
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
    setCurrentHour(-1);
    return;
  }
  return outputData;
}

function allDefined(
  records: (OutputDatum[] | undefined)[],
): records is OutputDatum[][] {
  return records.every((r) => r !== undefined);
}

export async function addNewRecords(hour: number) {
  console.log(logMessage(hour, 'fetching data'));

  await Promise.all(
    Object.keys(locationIdToLocation).map((id) => _addNewRecord(hour, id)),
  ).then((outputData) => {
    if (allDefined(outputData)) {
      writeToDB('weather.pgf.json', JSON.stringify(outputData.flat(), null, 2));
      console.log(logMessage(hour, 'data recorded'));
      console.log();
    } else {
      setCurrentHour(-1);
      return;
    }
  });
}
