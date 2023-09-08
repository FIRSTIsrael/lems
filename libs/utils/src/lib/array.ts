export const ensureArray = (value: any | Array<any>) => {
  return Array.isArray(value) ? value : [value];
};
