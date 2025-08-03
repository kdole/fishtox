export interface RegressionResult {
  a: number;  // coefficient
  b: number;  // exponent
  rSquared: number;
  predict: (x: number) => number;
}

export interface TrendLinePoint {
  lengthInches: number;
  mercuryPpm: number;
}

/**
 * Performs power law regression: y = a * x^b
 * Uses log-log transformation: log(y) = log(a) + b * log(x)
 * Returns coefficients and R² value
 */
export function powerLawRegression(
  xValues: number[],
  yValues: number[],
  minPoints: number = 3
): RegressionResult | null {
  if (xValues.length !== yValues.length || xValues.length < minPoints) {
    return null;
  }

  // Filter out invalid values (zero or negative)
  const validPairs: Array<[number, number]> = [];
  for (let i = 0; i < xValues.length; i++) {
    if (xValues[i] > 0 && yValues[i] > 0) {
      validPairs.push([xValues[i], yValues[i]]);
    }
  }

  if (validPairs.length < minPoints) {
    return null;
  }

  // Transform to log space
  const logX = validPairs.map(([x]) => Math.log(x));
  const logY = validPairs.map(([, y]) => Math.log(y));

  // Linear regression on log-transformed data
  const n = logX.length;
  const sumLogX = logX.reduce((sum, x) => sum + x, 0);
  const sumLogY = logY.reduce((sum, y) => sum + y, 0);
  const sumLogXLogY = logX.reduce((sum, x, i) => sum + x * logY[i], 0);
  const sumLogXSquared = logX.reduce((sum, x) => sum + x * x, 0);

  const meanLogX = sumLogX / n;
  const meanLogY = sumLogY / n;

  // Calculate slope (b) and intercept (log(a))
  const numerator = sumLogXLogY - n * meanLogX * meanLogY;
  const denominator = sumLogXSquared - n * meanLogX * meanLogX;

  if (Math.abs(denominator) < 1e-10) {
    return null; // Avoid division by zero
  }

  const b = numerator / denominator;
  const logA = meanLogY - b * meanLogX;
  const a = Math.exp(logA);

  // Calculate R²
  const totalSumSquares = logY.reduce((sum, y) => sum + (y - meanLogY) ** 2, 0);
  const residualSumSquares = logY.reduce((sum, y, i) => {
    const predicted = logA + b * logX[i];
    return sum + (y - predicted) ** 2;
  }, 0);

  const rSquared = totalSumSquares > 0 ? 1 - residualSumSquares / totalSumSquares : 0;

  return {
    a,
    b,
    rSquared: Math.max(0, Math.min(1, rSquared)), // Clamp between 0 and 1
    predict: (x: number) => a * Math.pow(x, b),
  };
}

/**
 * Generate trend line points for visualization
 */
export function generateTrendLinePoints(
  regression: RegressionResult,
  minX: number,
  maxX: number,
  numPoints: number = 50
): TrendLinePoint[] {
  const points: TrendLinePoint[] = [];
  const step = (maxX - minX) / (numPoints - 1);

  for (let i = 0; i < numPoints; i++) {
    const x = minX + i * step;
    const y = regression.predict(x);
    
    // Only include valid predictions
    if (y > 0 && isFinite(y)) {
      points.push({
        lengthInches: x,
        mercuryPpm: y,
      });
    }
  }

  return points;
}