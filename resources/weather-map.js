const WINDY = 'Windy';
const PARTLY_CLOUDY = 'Partly Cloudy';
const SUNNY = 'Sunny';
const CLEAR = 'Clear';
const CLOUDY = 'Cloudy';
const FOG = 'Fog';
const RAIN = 'Rain';
const SNOW = 'Snow';

exports.WINDY = WINDY;

exports.weatherMapWithWind = {
  Sunny: SUNNY,
  'Mostly sunny': SUNNY,
  'Partly sunny': PARTLY_CLOUDY,
  'Intermittent clouds': PARTLY_CLOUDY,
  'Hazy sunshine': CLOUDY,
  'Mostly cloudy': CLOUDY,
  Cloudy: CLOUDY,
  'Dreary (Overcast)': CLOUDY,
  Clear: CLEAR,
  'Mostly clear': CLEAR,
  'Partly cloudy': PARTLY_CLOUDY,
  // 'Intermittent clouds': PARTLY_CLOUDY,
  'Hazy moonlight': CLOUDY,
  // 'Mostly cloudy': CLOUDY,
};
exports.weatherMapWithoutWind = {
  Fog: FOG,
  Showers: RAIN,
  'Mostly cloudy w/ showers': CLOUDY,
  'Partly sunny w/ showers': PARTLY_CLOUDY,
  Thunderstorms: RAIN,
  'Mostly cloudy w/ t-storms': CLOUDY,
  'Partly sunny w/ t-storms': PARTLY_CLOUDY,
  Rain: RAIN,
  Flurries: RAIN,
  'Mostly cloudy w/ flurries': CLOUDY,
  'Partly sunny w/ flurries': PARTLY_CLOUDY,
  Snow: SNOW,
  'Mostly cloudy w/ snow': CLOUDY,
  Ice: SNOW,
  Sleet: SNOW,
  'Freezing rain': 'unknown',
  'Rain and snow': 'unknown',
  Windy: WINDY,
  'Partly cloudy w/ showers': PARTLY_CLOUDY,
  // 'Mostly cloudy w/ showers': CLOUDY,
  'Partly cloudy w/ t-storms': PARTLY_CLOUDY,
  // 'Mostly cloudy w/ t-storms': CLOUDY,
  // 'Mostly cloudy w/ flurries': CLOUDY,
  'Mostly cloudy w/ snow': CLOUDY,
};
