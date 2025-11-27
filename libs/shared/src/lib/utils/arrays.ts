export const ensureArray = (value: unknown | Array<unknown>, allowNull = false) => {
  if ((!allowNull && value === null) || value === undefined) return [];
  return Array.isArray(value) ? value : [value];
};

export const reorderArray = <T>(arr: Array<T>, startIndex: number, endIndex: number) => {
  const result = [...arr];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};
