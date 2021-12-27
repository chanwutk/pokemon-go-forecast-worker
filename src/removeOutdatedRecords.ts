import { logMessage, getFromDB, writeToDB } from './utils';

export async function removeOutdatedRecords(hour: number) {
  console.log(logMessage(hour, 'update records'));
  const records: OutputDatum[] = await getFromDB('/weather');
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
  await writeToDB('/modify-weather', JSON.stringify(records));
  console.log(logMessage(hour, 'records updated'));
  console.log();
}
