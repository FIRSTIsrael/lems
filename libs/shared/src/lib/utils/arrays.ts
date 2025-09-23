export const ensureArray = (value: unknown | Array<unknown>, allowNull = false) => {
  if ((!allowNull && value === null) || value === undefined) return [];
  return Array.isArray(value) ? value : [value];
};
