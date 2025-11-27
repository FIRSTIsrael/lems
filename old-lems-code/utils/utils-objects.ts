export const partialMatch = <T>(partial: Partial<T>, full: T): boolean => {
  return Object.keys(partial).every(
    key => JSON.stringify(partial[key as keyof T]) === JSON.stringify(full[key as keyof T])
  );
};

export const fullMatch = <T>(obj1: T, obj2: T): boolean => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

export const getDiff = (base: Record<string, any>, compare: Record<string, any>) => {
  const result: Record<string, any> = {};

  Object.entries(compare).forEach(([key, value]) => {
    if (base.hasOwnProperty(key) && base[key] === value) {
      return;
    }
    result[key] = value;
  });

  return result;
};

// TODO: ES2024 implements Object.groupBy natively, so make sure to remove this when upgrading to it.
export const groupBy = <T>(
  array: Array<T>,
  predicate: (value: T, index: number, array: Array<T>) => string
) =>
  array.reduce(
    (acc, value, index, array) => {
      (acc[predicate(value, index, array)] ||= []).push(value);
      return acc;
    },
    {} as { [key: string]: T[] }
  );
