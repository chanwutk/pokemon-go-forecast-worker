import { logMessage, getFromDB, writeToDB } from './utils';

export async function removeOutdatedRecords(hour: number) {
  console.log(logMessage(hour, 'update records'));
  try {
    const records: OutputDatum[] = getFromDB('weather.json');
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
    writeToDB('weather.json', JSON.stringify(records));
    console.log(logMessage(hour, 'records updated'));
    console.log();
  } catch {
    writeToDB('weather.json', '[]');
    console.log(logMessage(hour, 'records updated (empty weather)'));
    console.log();
  }
}
