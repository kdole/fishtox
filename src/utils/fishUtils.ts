import { FishSample } from '../types/fish';

export const getUniqueSpecies = (fishData: FishSample[]): string[] => {
  const speciesSet = new Set(fishData.map(fish => fish.species));
  return Array.from(speciesSet).sort();
};

export const filterBySpecies = (fishData: FishSample[], species: string | null): FishSample[] => {
  if (!species) return fishData;
  return fishData.filter(fish => fish.species === species);
};