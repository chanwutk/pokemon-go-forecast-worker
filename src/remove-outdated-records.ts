import { logMessage, getFromDB, writeToDB } from './utils';

export async function removeOutdatedRecords(hour: number) {
  console.log(logMessage(hour, 'update records'));
  try {
    const records: OutputDatum[] = getFromDB('weather.pgf.json');
    let currentOrder: number = 0;
    for (const record of records) {
      if (hour === record.time) {
        currentOrder = record.order;
        break;
      }
    }

    for (const record of records) {
      if (record.order < currentOrder) record.weather = null;
    }
    writeToDB('weather.pgf.json', JSON.stringify(records, null, 2));
    console.log(logMessage(hour, 'records updated'));
    console.log();
  } catch {
    writeToDB('weather.pgf.json', '[]');
    console.log(logMessage(hour, 'records updated (empty weather)'));
    console.log();
  }
}
