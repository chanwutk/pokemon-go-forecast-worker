interface OutputDatum {
  time: number;
  city: string;
  weather: string | null;
  types: string;
  order: number;
}

type RawDatum = any;
