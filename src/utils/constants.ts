export const SPECIES_COLORS = [
  '#1976d2', // Blue
  '#d32f2f', // Red
  '#388e3c', // Green
  '#f57c00', // Orange
  '#7b1fa2', // Purple
  '#0288d1', // Light Blue
  '#c2185b', // Pink
  '#5d4037', // Brown
  '#455a64', // Blue Grey
  '#e64a19', // Deep Orange
];

export const getSpeciesColor = (species: string, allSpecies: string[]): string => {
  const index = allSpecies.indexOf(species);
  return SPECIES_COLORS[index % SPECIES_COLORS.length];
};
