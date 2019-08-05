const CLEAR_AND_SUNNY: string = 'Fire, Grass, Gound';

export const weatherToType = {
  Clear: CLEAR_AND_SUNNY,
  Sunny: CLEAR_AND_SUNNY,
  'Partly Cloudy': 'Normal, Rock',
  Cloudy: 'Fairy, Fighting, Poison',
  Rain: 'Water, Electric, Bug',
  Snow: 'Ice, Steel',
  Fog: 'Dark, Ghost',
  Windy: 'Dragon, Flying, Psychic',
};

export type WeatherToTypeProps = keyof typeof weatherToType;