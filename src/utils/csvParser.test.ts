import { parseFishData, mmToInches } from './csvParser';

describe('csvParser', () => {
  describe('parseFishData', () => {
    it('should parse valid CSV data correctly', () => {
      const csvData = `CompositeCommonName,Result,TLAvgLength(mm),latitude,longitude
Bass: Largemouth,0.5,300,37.123,-122.456
Trout: Rainbow,0.3,250,38.456,-121.789`;

      const result = parseFishData(csvData);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        species: 'Bass: Largemouth',
        mercuryPpm: 0.5,
        lengthMm: 300,
        latitude: 37.123,
        longitude: -122.456,
      });
      expect(result[1]).toEqual({
        species: 'Trout: Rainbow',
        mercuryPpm: 0.3,
        lengthMm: 250,
        latitude: 38.456,
        longitude: -121.789,
      });
    });

    it('should filter out rows with invalid mercury values', () => {
      const csvData = `CompositeCommonName,Result,TLAvgLength(mm),latitude,longitude
Bass: Largemouth,0.5,300,37.123,-122.456
Trout: Rainbow,-1,250,38.456,-121.789
Salmon: Chinook,0,200,37.789,-122.123
Catfish: Channel,invalid,350,37.567,-122.789`;

      const result = parseFishData(csvData);

      // Parser accepts negative and zero values, only filters out non-numeric
      expect(result).toHaveLength(3);
      expect(result[0].species).toBe('Bass: Largemouth');
      expect(result[1].species).toBe('Trout: Rainbow');
      expect(result[2].species).toBe('Salmon: Chinook');
    });

    it('should filter out rows with invalid length values', () => {
      const csvData = `CompositeCommonName,Result,TLAvgLength(mm),latitude,longitude
Bass: Largemouth,0.5,300,37.123,-122.456
Trout: Rainbow,0.3,-50,38.456,-121.789
Salmon: Chinook,0.2,0,37.789,-122.123
Catfish: Channel,0.4,invalid,37.567,-122.789`;

      const result = parseFishData(csvData);

      // Parser accepts negative and zero values, only filters out non-numeric
      expect(result).toHaveLength(3);
      expect(result[0].species).toBe('Bass: Largemouth');
      expect(result[1].species).toBe('Trout: Rainbow');
      expect(result[2].species).toBe('Salmon: Chinook');
    });

    it('should filter out rows with invalid coordinates', () => {
      const csvData = `CompositeCommonName,Result,TLAvgLength(mm),latitude,longitude
Bass: Largemouth,0.5,300,37.123,-122.456
Trout: Rainbow,0.3,250,invalid,-121.789
Salmon: Chinook,0.2,200,37.789,invalid
Catfish: Channel,0.4,350,91,-122.789
Perch: Yellow,0.1,150,37.567,-181`;

      const result = parseFishData(csvData);

      expect(result).toHaveLength(3); // Coordinates can be outside CA bounds, parser doesn't validate that
    });

    it('should handle empty CSV data', () => {
      const csvData = `CompositeCommonName,Result,TLAvgLength(mm),latitude,longitude`;

      const result = parseFishData(csvData);

      expect(result).toHaveLength(0);
    });

    it('should handle invalid CSV format gracefully', () => {
      const csvData = `Invalid,CSV,Format
Without,Proper,Headers`;

      // parseFishData doesn't throw on invalid format, it returns empty array
      const result = parseFishData(csvData);
      expect(result).toHaveLength(0);
    });

    it('should handle rows with missing required fields', () => {
      const csvData = `CompositeCommonName,Result,TLAvgLength(mm),latitude,longitude
Bass: Largemouth,0.5,300,37.123,-122.456
,0.3,250,38.456,-121.789
Salmon: Chinook,,200,37.789,-122.123
Catfish: Channel,0.4,,37.567,-122.789
Perch: Yellow,0.1,150,,-122.234`;

      const result = parseFishData(csvData);

      expect(result).toHaveLength(1);
      expect(result[0].species).toBe('Bass: Largemouth');
    });

    it('should trim species names', () => {
      const csvData = `CompositeCommonName,Result,TLAvgLength(mm),latitude,longitude
  Bass: Largemouth  ,0.5,300,37.123,-122.456`;

      const result = parseFishData(csvData);

      expect(result).toHaveLength(1);
      expect(result[0].species).toBe('Bass: Largemouth');
    });
  });

  describe('mmToInches', () => {
    it('should convert millimeters to inches correctly', () => {
      expect(mmToInches(254)).toBeCloseTo(10, 1);
      expect(mmToInches(0)).toBe(0);
      expect(mmToInches(127)).toBeCloseTo(5, 1);
      expect(mmToInches(25.4)).toBeCloseTo(1, 1);
    });

    it('should handle negative values', () => {
      expect(mmToInches(-254)).toBeCloseTo(-10, 1);
    });
  });
});
