import {
  InsightsExplorerAggregation,
  InsightsLinearRegression,
  InsightsSummary
} from '@lems/types/api/admin';

export const sum = (values: number[]): number => values.reduce((acc, value) => acc + value, 0);

export const mean = (values: number[]): number | null =>
  values.length === 0 ? null : sum(values) / values.length;

/**
 * Percentile using linear interpolation between closest ranks.
 * @param p - Percentile in the range [0, 1]
 */
export const percentile = (values: number[], p: number): number | null => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
};

export const median = (values: number[]): number | null => percentile(values, 0.5);

/** Population standard deviation. */
export const stdDev = (values: number[]): number | null => {
  const average = mean(values);
  if (average === null) return null;
  return Math.sqrt(mean(values.map(value => (value - average) ** 2)) as number);
};

export const min = (values: number[]): number | null =>
  values.length === 0 ? null : Math.min(...values);

export const max = (values: number[]): number | null =>
  values.length === 0 ? null : Math.max(...values);

export const summarize = (values: number[]): InsightsSummary => ({
  count: values.length,
  average: mean(values),
  median: median(values),
  min: min(values),
  max: max(values),
  stdDev: stdDev(values)
});

export const aggregate = (
  values: number[],
  aggregation: InsightsExplorerAggregation
): number | null => {
  switch (aggregation) {
    case 'average':
      return mean(values);
    case 'median':
      return median(values);
    case 'min':
      return min(values);
    case 'max':
      return max(values);
    case 'sum':
      return values.length === 0 ? null : sum(values);
    case 'count':
      return values.length;
    case 'std-dev':
      return stdDev(values);
  }
};

/**
 * Ordinary least squares linear regression of y on x (y = slope * x + intercept),
 * along with the Pearson correlation coefficient (r) and coefficient of determination (r²).
 *
 * Returns null when there are fewer than 2 points or when x has no variance.
 */
export const linearRegression = (
  points: Array<{ x: number; y: number }>
): InsightsLinearRegression | null => {
  const n = points.length;
  if (n < 2) return null;

  const meanX = sum(points.map(p => p.x)) / n;
  const meanY = sum(points.map(p => p.y)) / n;

  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (const { x, y } of points) {
    sxx += (x - meanX) ** 2;
    syy += (y - meanY) ** 2;
    sxy += (x - meanX) * (y - meanY);
  }

  if (sxx === 0) return null;

  const slope = sxy / sxx;
  const intercept = meanY - slope * meanX;
  const r = syy === 0 ? 0 : sxy / Math.sqrt(sxx * syy);

  return { slope, intercept, r, r2: r * r, n };
};

/** Groups items into a Map by a key selector, preserving insertion order. */
export const groupBy = <T, K>(items: T[], key: (item: T) => K): Map<K, T[]> => {
  const groups = new Map<K, T[]>();
  for (const item of items) {
    const k = key(item);
    const group = groups.get(k);
    if (group) group.push(item);
    else groups.set(k, [item]);
  }
  return groups;
};
