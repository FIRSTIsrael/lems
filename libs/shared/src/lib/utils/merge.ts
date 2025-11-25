/**
 * Checks if a value is a plain object (not an array, Date, or other special object)
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  // Check if it's a plain object and not an array, Date, etc.
  const prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Deep merges multiple objects together.
 * Later objects override earlier ones.
 * Only plain objects are merged recursively - arrays, dates, and other special objects are replaced.
 *
 * @param objects - Objects to merge
 * @returns A new merged object
 *
 * @example
 * ```ts
 * const result = merge(
 *   { a: 1, b: { c: 2 } },
 *   { b: { d: 3 } }
 * );
 * // { a: 1, b: { c: 2, d: 3 } }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function merge<T = any>(base: T, ...updates: any[]): T {
  if (!base) {
    return (updates[0] || {}) as T;
  }

  if (updates.length === 0) {
    return base;
  }

  const result = { ...base } as Record<string, unknown>;

  for (const obj of updates) {
    if (!isPlainObject(obj)) {
      continue;
    }

    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) {
        continue;
      }

      const newValue = obj[key];
      const existingValue = result[key];

      // If both are plain objects, merge recursively
      if (isPlainObject(existingValue) && isPlainObject(newValue)) {
        result[key] = merge(existingValue, newValue);
      } else {
        // Otherwise, replace with the new value
        result[key] = newValue;
      }
    }
  }

  return result as T;
}
