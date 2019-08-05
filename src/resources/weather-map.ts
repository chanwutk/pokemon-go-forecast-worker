export const WINDY: string = 'Windy';
const PARTLY_CLOUDY: string = 'Partly Cloudy';
const SUNNY: string = 'Sunny';
const CLEAR: string = 'Clear';
const CLOUDY: string = 'Cloudy';
const FOG: string = 'Fog';
const RAIN: string = 'Rain';
const SNOW: string = 'Snow';

export const iconPhraseToInGameWeather: object = {
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
  'Hazy moonlight': CLOUDY,
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
  'Partly cloudy w/ t-storms': PARTLY_CLOUDY,
};

export type IconPhrase = keyof typeof iconPhraseToInGameWeather;
