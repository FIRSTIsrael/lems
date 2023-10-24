export const ensureArray = (value: any | Array<any>) => {
  return Array.isArray(value) ? value : [value];
};

export const reorder = (arr: Array<any>, startIndex: number, endIndex: number) => {
  const result = [...arr];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};
