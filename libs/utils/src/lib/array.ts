export const ensureArray = (value: any | Array<any>) => {
  return Array.isArray(value) ? value : [value];
};

export const replaceArrayElement = (
  array: Array<any>,
  condition: (e: any) => boolean,
  newElement: any
) => {
  return array.map(e => {
    if (condition(e)) {
      return newElement;
    } else {
      return e;
    }
  });
};
