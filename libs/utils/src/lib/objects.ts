export const partialMatch = <T>(partial: Partial<T>, full: T): boolean => {
  return Object.keys(partial).every(
    key => JSON.stringify(partial[key as keyof T]) === JSON.stringify(full[key as keyof T])
  );
};
