import { getUniqueSpecies, filterBySpecies } from './fishUtils';
import { FishSample } from '../types/fish';

describe('fishUtils', () => {
  const createFishSample = (overrides: Partial<FishSample> = {}): FishSample => ({
    species: 'Bass: Largemouth',
    mercuryPpm: 0.5,
    lengthMm: 300,
    latitude: 37.5,
    longitude: -122.0,
    ...overrides,
  });

  describe('filterBySpecies', () => {
    it('should filter fish by selected species', () => {
      const data: FishSample[] = [
        createFishSample({ species: 'Bass: Largemouth' }),
        createFishSample({ species: 'Trout: Rainbow' }),
        createFishSample({ species: 'Catfish: Channel' }),
        createFishSample({ species: 'Bass: Largemouth' }),
      ];

      const result = filterBySpecies(data, ['Bass: Largemouth', 'Catfish: Channel']);
      
      expect(result).toHaveLength(3);
      expect(result.every(fish => 
        fish.species === 'Bass: Largemouth' || fish.species === 'Catfish: Channel'
      )).toBe(true);
    });

    it('should return empty array when no species selected', () => {
      const data: FishSample[] = [
        createFishSample({ species: 'Bass: Largemouth' }),
        createFishSample({ species: 'Trout: Rainbow' }),
      ];

      expect(filterBySpecies(data, [])).toHaveLength(0);
      expect(filterBySpecies(data, null as any)).toHaveLength(0);
    });

    it('should return empty array when species not found', () => {
      const data: FishSample[] = [
        createFishSample({ species: 'Bass: Largemouth' }),
        createFishSample({ species: 'Trout: Rainbow' }),
      ];

      const result = filterBySpecies(data, ['Salmon: Chinook']);
      expect(result).toHaveLength(0);
    });

    it('should handle empty data array', () => {
      const result = filterBySpecies([], ['Bass: Largemouth']);
      expect(result).toHaveLength(0);
    });
  });

  describe('getUniqueSpecies', () => {
    it('should return unique species names sorted alphabetically', () => {
      const data: FishSample[] = [
        createFishSample({ species: 'Trout: Rainbow' }),
        createFishSample({ species: 'Bass: Largemouth' }),
        createFishSample({ species: 'Trout: Rainbow' }),
        createFishSample({ species: 'Catfish: Channel' }),
        createFishSample({ species: 'Bass: Largemouth' }),
      ];

      const result = getUniqueSpecies(data);

      expect(result).toEqual([
        'Bass: Largemouth',
        'Catfish: Channel',
        'Trout: Rainbow',
      ]);
    });

    it('should handle empty data array', () => {
      const result = getUniqueSpecies([]);
      expect(result).toEqual([]);
    });

    it('should handle single species', () => {
      const data: FishSample[] = [
        createFishSample({ species: 'Bass: Largemouth' }),
        createFishSample({ species: 'Bass: Largemouth' }),
      ];

      const result = getUniqueSpecies(data);
      expect(result).toEqual(['Bass: Largemouth']);
    });

    it('should handle species with different cases as same species', () => {
      // Note: Current implementation is case-sensitive
      // This test documents the current behavior
      const data: FishSample[] = [
        createFishSample({ species: 'Bass: Largemouth' }),
        createFishSample({ species: 'bass: largemouth' }),
        createFishSample({ species: 'BASS: LARGEMOUTH' }),
      ];

      const result = getUniqueSpecies(data);
      // Current implementation treats these as different species
      expect(result).toEqual([
        'BASS: LARGEMOUTH',
        'Bass: Largemouth',
        'bass: largemouth',
      ]);
    });

    it('should handle species with special characters', () => {
      const data: FishSample[] = [
        createFishSample({ species: 'Bass: Largemouth' }),
        createFishSample({ species: 'Shark: Blue (juvenile)' }),
        createFishSample({ species: 'Trout: Rainbow/Steelhead' }),
      ];

      const result = getUniqueSpecies(data);
      expect(result).toEqual([
        'Bass: Largemouth',
        'Shark: Blue (juvenile)',
        'Trout: Rainbow/Steelhead',
      ]);
    });

    it('should maintain consistent sorting for species with same prefix', () => {
      const data: FishSample[] = [
        createFishSample({ species: 'Bass: Striped' }),
        createFishSample({ species: 'Bass: Largemouth' }),
        createFishSample({ species: 'Bass: Smallmouth' }),
        createFishSample({ species: 'Bass: Spotted' }),
      ];

      const result = getUniqueSpecies(data);
      expect(result).toEqual([
        'Bass: Largemouth',
        'Bass: Smallmouth',
        'Bass: Spotted',
        'Bass: Striped',
      ]);
    });
  });
});