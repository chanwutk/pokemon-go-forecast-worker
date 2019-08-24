declare module 'xmlhttprequest';

interface OutputDatum {
  time: number;
  city: string;
  weather: string | null;
  types: string;
  order: number;
}

interface RawDatum {
  DateTime: string;
  IconPhrase: string;
  Wind: {
    Speed: {
      Value: number;
    };
  };
  WindGust: {
    Speed: {
      Value: number;
    };
  };
  HasPrecipitation: boolean;
}
