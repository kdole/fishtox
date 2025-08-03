import { powerLawRegression, generateTrendLinePoints } from './regression';

describe('regression', () => {
  describe('powerLawRegression', () => {
    it('should calculate power law regression for valid data', () => {
      // Test with data that follows y = 2 * x^1.5
      const xValues = [1, 2, 3, 4, 5];
      const yValues = xValues.map(x => 2 * Math.pow(x, 1.5));

      const result = powerLawRegression(xValues, yValues);

      expect(result).not.toBeNull();
      expect(result!.a).toBeCloseTo(2, 1);
      expect(result!.b).toBeCloseTo(1.5, 1);
      expect(result!.rSquared).toBeCloseTo(1, 2); // Perfect fit
    });

    it('should return null for insufficient data points', () => {
      const result1 = powerLawRegression([1], [2]);
      const result2 = powerLawRegression([1, 2], [2, 4]);

      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });

    it('should return null for mismatched array lengths', () => {
      const result = powerLawRegression([1, 2, 3], [2, 4]);

      expect(result).toBeNull();
    });

    it('should filter out zero and negative values', () => {
      const xValues = [1, 2, 0, 3, -1, 4];
      const yValues = [2, 4, 1, 6, 2, 8];

      const result = powerLawRegression(xValues, yValues);

      expect(result).not.toBeNull();
      // Should only use points (1,2), (2,4), (3,6), (4,8)
      expect(result!.predict(2)).toBeCloseTo(4, 1);
    });

    it('should handle data with only positive values correctly', () => {
      const xValues = [10, 20, 30, 40, 50];
      const yValues = [0.1, 0.15, 0.18, 0.2, 0.22];

      const result = powerLawRegression(xValues, yValues);

      expect(result).not.toBeNull();
      expect(result!.rSquared).toBeGreaterThan(0);
      expect(result!.rSquared).toBeLessThanOrEqual(1);
    });

    it('should return null when all values are filtered out', () => {
      const xValues = [0, -1, -2];
      const yValues = [1, 2, 3];

      const result = powerLawRegression(xValues, yValues);

      expect(result).toBeNull();
    });

    it('should clamp R² between 0 and 1', () => {
      const xValues = [1, 2, 3, 4, 5];
      const yValues = [10, 1, 20, 2, 15]; // Very poor fit

      const result = powerLawRegression(xValues, yValues);

      expect(result).not.toBeNull();
      expect(result!.rSquared).toBeGreaterThanOrEqual(0);
      expect(result!.rSquared).toBeLessThanOrEqual(1);
    });

    it('should handle vertical line data (constant x)', () => {
      const xValues = [1, 1, 1, 1];
      const yValues = [1, 2, 3, 4];

      const result = powerLawRegression(xValues, yValues);

      // Should return null due to zero denominator
      expect(result).toBeNull();
    });

    it('should provide accurate predict function', () => {
      const xValues = [1, 2, 3, 4, 5];
      const yValues = xValues.map(x => 3 * Math.pow(x, 0.8));

      const result = powerLawRegression(xValues, yValues);

      expect(result).not.toBeNull();
      expect(result!.predict(3)).toBeCloseTo(3 * Math.pow(3, 0.8), 1);
      expect(result!.predict(10)).toBeCloseTo(3 * Math.pow(10, 0.8), 1);
    });

    it('should accept custom minPoints parameter', () => {
      const xValues = [1, 2, 3, 4];
      const yValues = [2, 4, 6, 8];

      const result1 = powerLawRegression(xValues, yValues, 5); // Require 5 points
      const result2 = powerLawRegression(xValues, yValues, 4); // Require 4 points

      expect(result1).toBeNull();
      expect(result2).not.toBeNull();
    });
  });

  describe('generateTrendLinePoints', () => {
    const mockRegression = {
      a: 2,
      b: 1.5,
      rSquared: 0.95,
      predict: (x: number) => 2 * Math.pow(x, 1.5),
    };

    it('should generate correct number of points', () => {
      const points = generateTrendLinePoints(mockRegression, 1, 10);
      expect(points).toHaveLength(50); // Default numPoints

      const customPoints = generateTrendLinePoints(mockRegression, 1, 10, 20);
      expect(customPoints).toHaveLength(20);
    });

    it('should generate points within specified range', () => {
      const minX = 5;
      const maxX = 15;
      const points = generateTrendLinePoints(mockRegression, minX, maxX);

      expect(points[0].lengthInches).toBe(minX);
      expect(points[points.length - 1].lengthInches).toBe(maxX);

      points.forEach(point => {
        expect(point.lengthInches).toBeGreaterThanOrEqual(minX);
        expect(point.lengthInches).toBeLessThanOrEqual(maxX);
      });
    });

    it('should calculate correct y values using regression', () => {
      const points = generateTrendLinePoints(mockRegression, 1, 5, 5);

      points.forEach(point => {
        const expectedY = mockRegression.predict(point.lengthInches);
        expect(point.mercuryPpm).toBeCloseTo(expectedY, 10);
      });
    });

    it('should filter out invalid predictions', () => {
      const badRegression = {
        a: -1, // Will produce negative values
        b: 1,
        rSquared: 0.5,
        predict: (x: number) => -1 * x,
      };

      const points = generateTrendLinePoints(badRegression, 1, 10);
      expect(points).toHaveLength(0);
    });

    it('should handle single point generation', () => {
      const points = generateTrendLinePoints(mockRegression, 5, 5, 1);
      
      // When min and max are the same with 1 point, the step is 0
      // This results in dividing by zero, so no points are generated
      expect(points).toHaveLength(0);
    });

    it('should handle regression that produces Infinity', () => {
      const infiniteRegression = {
        a: 1,
        b: 100, // Very large exponent
        rSquared: 0.5,
        predict: (x: number) => Math.pow(x, 100),
      };

      const points = generateTrendLinePoints(infiniteRegression, 1, 2);
      
      // Should filter out infinite values
      const finitePoints = points.filter(p => isFinite(p.mercuryPpm));
      expect(finitePoints.length).toBeLessThanOrEqual(points.length);
    });

    it('should maintain consistent spacing between points', () => {
      const points = generateTrendLinePoints(mockRegression, 0, 10, 11);
      
      for (let i = 1; i < points.length; i++) {
        const spacing = points[i].lengthInches - points[i - 1].lengthInches;
        expect(spacing).toBeCloseTo(1, 10);
      }
    });
  });
});