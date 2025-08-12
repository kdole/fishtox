export interface FishSample {
  species: string;        // From CompositeCommonName column
  mercuryPpm: number;     // From Result column (wet weight)
  lengthMm: number;       // From TLAvgLength(mm) column
  latitude: number;       // From latitude column
  longitude: number;      // From longitude column
}

export interface RawFishData {
  CompositeCommonName: string;
  Result: string;
  'TLAvgLength(mm)': string;
  latitude: string;
  longitude: string;
}
