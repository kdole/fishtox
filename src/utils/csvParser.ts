import Papa from 'papaparse';
import { FishSample, RawFishData } from '../types/fish';

export const parseFishData = (csvData: string): FishSample[] => {
  const parsed = Papa.parse<RawFishData>(csvData, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    console.error('CSV parsing errors:', parsed.errors);
  }

  return parsed.data
    .filter(row => {
      // Filter out rows with missing or invalid data
      return (
        row.CompositeCommonName &&
        row.Result &&
        row['TLAvgLength(mm)'] &&
        row.latitude &&
        row.longitude &&
        !isNaN(parseFloat(row.Result)) &&
        !isNaN(parseFloat(row['TLAvgLength(mm)'])) &&
        !isNaN(parseFloat(row.latitude)) &&
        !isNaN(parseFloat(row.longitude))
      );
    })
    .map(row => ({
      species: row.CompositeCommonName.trim(),
      mercuryPpm: parseFloat(row.Result),
      lengthMm: parseFloat(row['TLAvgLength(mm)']),
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
    }));
};

export const mmToInches = (mm: number): number => {
  return mm / 25.4;
};

export const loadFishData = async (): Promise<FishSample[]> => {
  try {
    const response = await fetch('/data/filtered_ceden_mercury.csv');
    const csvText = await response.text();
    return parseFishData(csvText);
  } catch (error) {
    console.error('Error loading fish data:', error);
    throw error;
  }
};
