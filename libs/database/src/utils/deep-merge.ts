/**
 * Recursively makes all properties of `T` (including nested objects) optional.
 */
export type DeepPartial<T> = T extends object
  ? {
      [K in keyof T]?: DeepPartial<T[K]>;
    }
  : T;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Deep merges `source` onto `target`, recursively merging plain object values.
 * Non-object values (including arrays) in `source` fully replace the corresponding value in `target`.
 */
export function deepMerge<T extends object>(target: T, source: DeepPartial<T>): T {
  const result: Record<string, unknown> = { ...(target as Record<string, unknown>) };

  for (const key of Object.keys(source)) {
    const sourceValue = (source as Record<string, unknown>)[key];
    const targetValue = result[key];

    if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
      result[key] = deepMerge(targetValue, sourceValue);
    } else {
      result[key] = sourceValue;
    }
  }

  return result as T;
}
