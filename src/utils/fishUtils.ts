import { FishSample } from '../types/fish';

export const getUniqueSpecies = (fishData: FishSample[]): string[] => {
  const speciesSet = new Set(fishData.map(fish => fish.species));
  return Array.from(speciesSet).sort();
};

export const filterBySpecies = (fishData: FishSample[], species: string[]): FishSample[] => {
  if (!species || species.length === 0) return [];
  return fishData.filter(fish => species.includes(fish.species));
};