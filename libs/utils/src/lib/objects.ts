export const partialMatch = <T>(partial: Partial<T>, full: T): boolean => {
  return Object.keys(partial).every(key => partial[key as keyof T] === full[key as keyof T]);
};
