const locations = require('./resources/locations');
const weatherMap = require('./resources/weather-map');
const types = require('./resources/types-map');
const apiKeys = require('./resources/api-keys');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const fs = require('fs');

const weatherWithWind = weatherMap.weatherMapWithWind;
const weatherWithoutWind = weatherMap.weatherMapWithoutWind;
const WINDY = weatherMap.WINDY;

const BASE_URL = 'http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/';
const ONE_MINUTE = 1000 * 60;
const RAW_PATH = './raw_weather/';
const TRANSLATED_PATH = './translated_weather/';

let currentHour = -1;
let keyCounter = 0;

function readLocalFile(url) {
  try {
    return fs.readFileSync(url).toString();
  } catch (err) {
    return '[]';
  }
}

function fetchWeather(locationId) {
  try {
    let url = BASE_URL + locationId + '?apikey=' + apiKeys[keyCounter] + '&details=true';
    keyCounter = (keyCounter + 1) % apiKeys.length;
    let xhttp = new XMLHttpRequest();
    let jsonOutput;

    xhttp.onreadystatechange = () => {
      if (xhttp.readyState === 4 && (xhttp.status === 200 || xhttp.status === 0))
        jsonOutput = JSON.parse(xhttp.responseText);
    };
    xhttp.open('GET', url, false);
    xhttp.send();

    console.log('   Location fetched: ' + locations[locationId]);

    return jsonOutput;
  } catch (err) {
    console.log('   fetch error:' + err);
    return null;
  }
}

const nianticFetchingHours = [2, 17];
const extraFetchingHours = [3, 4, 5, 6, 7];
const fetchingHours = nianticFetchingHours.concat(extraFetchingHours);
function isHourToCheck(hour) {
  return fetchingHours.includes(hour);
}

function extractTime(weatherData) {
  let time = Number(weatherData.DateTime.split('T')[1].split(':')[0]);
  return { time, data: weatherData };
}

function getFileName(id) {
  return 'weather_' + id + '.json';
}

function writeToFile(fileName, string) {
  fs.writeFileSync(fileName, string);
}

function translateWeather(data) {
  const iconPhrase = data.IconPhrase;
  if (weatherWithWind[iconPhrase]) {
    const windSpeed = data.Wind.Speed.Value;
    return windSpeed >= 14 ? WINDY : weatherWithWind[iconPhrase];
  } else if (weatherWithoutWind[iconPhrase]) {
    return weatherWithoutWind[iconPhrase];
  } else {
    console.log('Phrase not matched (' + iconPhrase + ')');
    return 'not-matched (' + iconPhrase + ')';
  }
}

function translateRawData(data) {
  return data.map(d => {
    return d !== null ? translateWeather(d) : null;
  });
}

function logMessage(hour, message) {
  return (hour < 10 ? ' ' : '') + hour + ':00 : ' + message;
}

var recordWeather = function() {
  let date = new Date();
  let offset = date.getTimezoneOffset() / 60;
  let hour = date.getHours() + offset + 7;

  if (currentHour !== hour) {
    currentHour = hour;
    if (isHourToCheck(hour)) {
      console.log(logMessage(hour, 'fetching data'));

      let outputData = [];
      for (const id in locations) {
        const fileName = getFileName(id);
        let currentData = JSON.parse(readLocalFile(RAW_PATH + fileName));
        let newWeather = fetchWeather(id);
        if (newWeather === null) {
          currentHour = -1;
          return;
        }

        if (nianticFetchingHours.includes(hour)) {
          for (let i = 0; i < currentData.length; i++) {
            if (i !== hour && i !== hour + 1) currentData[i] = null;
          }
        }

        for (let i = 1; i < newWeather.length; i++) {
          const { time, data } = extractTime(newWeather[i]);
          if (!nianticFetchingHours.includes(hour)) {
            if (currentData[time] === null) currentData[time] = data;
          } else currentData[time] = data;
        }

        writeToFile(RAW_PATH + fileName, JSON.stringify(currentData));
        const translatedData = translateRawData(currentData);
        for (const time in translatedData) {
          const weather = translatedData[time];
          const order = (Number(time) + 24 - hour) % 24;
          if (order <= 12) {
            outputData.push({
              time: Number(time),
              city: locations[id],
              weather,
              types: types[weather],
              order,
            });
          }
        }
      }

      writeToFile(TRANSLATED_PATH + 'weather.json', JSON.stringify(outputData));
      console.log(logMessage(hour, 'data recorded'));
      console.log();
    } else {
      console.log(logMessage(hour, 'update records'));

      const records = JSON.parse(readLocalFile(TRANSLATED_PATH + 'weather.json'));
      let currentOrder;
      for (const record of records) {
        if (hour === record.time) {
          currentOrder = record.order;
          break;
        }
      }

      for (const record of records) {
        if (record.order < currentOrder) record.weather = null;
      }

      writeToFile(TRANSLATED_PATH + 'weather.json', JSON.stringify(records));
      console.log(logMessage(hour, 'records updated'));
      console.log();
    }
  }
};

const INITIAL_WEATHER_DATA = JSON.stringify(new Array(24).fill(null));
for (const id in locations) {
  const fileName = getFileName(id);
  writeToFile(RAW_PATH + fileName, INITIAL_WEATHER_DATA);
}

recordWeather();
setInterval(recordWeather, ONE_MINUTE);
