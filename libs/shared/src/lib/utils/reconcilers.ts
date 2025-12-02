/**
 * Utility functions for writing GraphQL subscription reconcilers.
 * These helpers make it easier to update cached query data when subscriptions fire.
 */

/**
 * Type for a GraphQL subscription reconciler function.
 * This is the updateQuery function used in Apollo subscription configurations.
 *
 * @template TQueryData - The type of the cached query data
 * @template TSubscriptionData - The type of data returned by the subscription
 */
export type Reconciler<TQueryData, TSubscriptionData> = (
  prev: TQueryData,
  options: { data?: TSubscriptionData }
) => TQueryData;

/**
 * Updates an item in an array based on a predicate function.
 * Returns a new array with the matching item replaced.
 *
 * @param array - The array to search
 * @param predicate - Function that returns true for the item to replace
 * @param updater - Function that receives the found item and returns the updated item
 * @returns A new array with the item replaced, or the original array if no match
 *
 * @example
 * ```ts
 * const teams = [{ id: '1', arrived: false }, { id: '2', arrived: false }];
 * const updated = updateInArray(
 *   teams,
 *   team => team.id === '1',
 *   team => ({ ...team, arrived: true })
 * );
 * // [{ id: '1', arrived: true }, { id: '2', arrived: false }]
 * ```
 */
export function updateInArray<T>(
  array: T[],
  predicate: (item: T) => boolean,
  updater: (item: T) => T
): T[] {
  return array.map(item => (predicate(item) ? updater(item) : item));
}

/**
 * Updates an item in an array by ID.
 * Convenience wrapper around updateInArray for the common case of matching by ID.
 *
 * @param array - The array to search
 * @param id - The ID to match
 * @param updater - Function that receives the found item and returns the updated item
 * @returns A new array with the item replaced, or the original array if no match
 *
 * @example
 * ```ts
 * const teams = [{ id: '1', arrived: false }, { id: '2', arrived: false }];
 * const updated = updateById(teams, '1', team => ({ ...team, arrived: true }));
 * // [{ id: '1', arrived: true }, { id: '2', arrived: false }]
 * ```
 */
export function updateById<T extends { id: string }>(
  array: T[],
  id: string,
  updater: (item: T) => T
): T[] {
  return updateInArray(array, item => item.id === id, updater);
}

/**
 * Checks if a value is an object (not null, not an array)
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Recursively finds and replaces a value throughout an object structure.
 * Useful for updating deeply nested values in cached query data.
 *
 * @param target - The value to search (can be any type)
 * @param find - The value to find
 * @param replaceWith - The value to replace with
 * @returns A new structure with replaced values
 *
 * @example
 * ```ts
 * const data = { a: 1, b: { c: 1, d: 2 } };
 * const updated = findAndReplace(data, 1, 999);
 * // { a: 999, b: { c: 999, d: 2 } }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function findAndReplace<T = any>(target: T, find: any, replaceWith: any): T {
  if (!isObject(target)) {
    if (target === find) return replaceWith;
    return target;
  }

  return Object.keys(target).reduce(
    (carry, key) => {
      const val = target[key];
      carry[key] = findAndReplace(val, find, replaceWith);
      return carry;
    },
    {} as Record<string, unknown>
  ) as T;
}

/**
 * Recursively finds and replaces values in an object based on a predicate function.
 * More flexible than findAndReplace - allows custom matching logic.
 *
 * @param target - The value to search (can be any type)
 * @param predicate - Function that returns true for values to replace
 * @param replacer - Function that receives the found value and returns the replacement
 * @returns A new structure with replaced values
 *
 * @example
 * ```ts
 * const data = { a: 1, b: { c: 5, d: 10 } };
 * const updated = findAndReplaceBy(
 *   data,
 *   val => typeof val === 'number' && val > 3,
 *   val => val * 2
 * );
 * // { a: 1, b: { c: 10, d: 20 } }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function findAndReplaceBy<T = any>(
  target: T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  predicate: (value: any) => boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  replacer: (value: any) => any
): T {
  if (!isObject(target)) {
    if (predicate(target)) return replacer(target);
    return target;
  }

  return Object.keys(target).reduce(
    (carry, key) => {
      const val = target[key];
      carry[key] = findAndReplaceBy(val, predicate, replacer);
      return carry;
    },
    {} as Record<string, unknown>
  ) as T;
}

/**
 * Updates a nested property in an object structure using a path.
 * Useful for updating deeply nested values without manual spreading.
 *
 * @param obj - The object to update
 * @param path - Array of keys representing the path to the property
 * @param updater - Function that receives the current value and returns the new value
 * @returns A new object with the updated value
 *
 * @example
 * ```ts
 * const data = { division: { teams: [{ id: '1' }] } };
 * const updated = updateNested(
 *   data,
 *   ['division', 'teams'],
 *   teams => teams.map(t => ({ ...t, arrived: true }))
 * );
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function updateNested<T = any>(
  obj: T,
  path: string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updater: (value: any) => any
): T {
  if (path.length === 0) {
    return updater(obj);
  }

  if (!isObject(obj)) {
    return obj;
  }

  const [first, ...rest] = path;
  const currentValue = (obj as Record<string, unknown>)[first];

  return {
    ...obj,
    [first]: updateNested(currentValue, rest, updater)
  } as T;
}

/**
 * Updates a value in an object structure with multiple keys by matching a predicate.
 * Useful for updating a single item across multiple object properties where each property
 * contains a value that may need updating based on custom logic.
 *
 * @param obj - Object with multiple keys, each containing a value (or null/undefined)
 * @param predicate - Function that returns true for the item to update
 * @param updater - Function that receives the found item and returns the updated item
 * @returns A new object with the matching item updated, or the original if no match
 *
 * @example
 * ```ts
 * const rubrics = {
 *   innovationProject: { id: '1', status: 'empty' },
 *   robotDesign: { id: '2', status: 'empty' },
 *   coreValues: null
 * };
 * const updated = updateObjectKeysBy(
 *   rubrics,
 *   rubric => rubric?.id === '2',
 *   rubric => ({ ...rubric, status: 'completed' })
 * );
 * // { innovationProject: { id: '1', status: 'empty' }, robotDesign: { id: '2', status: 'completed' }, coreValues: null }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function updateObjectKeysBy<T = any>(
  obj: Record<string, T | null | undefined>,
  predicate: (item: T | null | undefined) => boolean,
  updater: (item: T | null | undefined) => T | null | undefined
): Record<string, T | null | undefined> {
  const updated = { ...obj };

  for (const key of Object.keys(updated)) {
    const item = updated[key];
    if (item && predicate(item)) {
      updated[key] = updater(item);
    }
  }

  return updated;
}

/**
 * Updates a value in an object structure with multiple keys by matching an ID.
 * Convenience wrapper around updateObjectKeysBy for the common case of matching by ID.
 *
 * @param obj - Object with multiple keys, each containing an object with id and other properties
 * @param targetId - The ID to match against
 * @param updater - Function that receives the found item and returns the updated item
 * @returns A new object with the matching item updated, or the original if no match
 *
 * @example
 * ```ts
 * const rubrics = {
 *   innovationProject: { id: '1', status: 'empty' },
 *   robotDesign: { id: '2', status: 'empty' },
 *   coreValues: null
 * };
 * const updated = updateObjectKeysById(rubrics, '2', rubric => ({ ...rubric, status: 'completed' }));
 * // { innovationProject: { id: '1', status: 'empty' }, robotDesign: { id: '2', status: 'completed' }, coreValues: null }
 * ```
 */
export function updateObjectKeysById<T extends { id: string } = { id: string }>(
  obj: Record<string, T | null | undefined>,
  targetId: string,
  updater: (item: T | null | undefined) => T | null | undefined
): Record<string, T | null | undefined> {
  return updateObjectKeysBy(
    obj,
    (item: T | null | undefined) => {
      if (!item || typeof item !== 'object') return false;
      return 'id' in item && (item as { id: string }).id === targetId;
    },
    updater
  );
}
