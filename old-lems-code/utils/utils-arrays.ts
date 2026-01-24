export const rankArray = (sortedArray: any[], evaluate: (i: any) => number, rankField: string) => {
  if (sortedArray.length < 2) return sortedArray;
  const _arr = [...sortedArray];
  _arr[0][rankField] = 1;
  for (let i = 1; i < _arr.length; i++) {
    if (evaluate(_arr[i]) === evaluate(_arr[i - 1])) {
      _arr[i][rankField] = _arr[i - 1][rankField];
    } else {
      _arr[i][rankField] = i + 1;
    }
  }
  return _arr;
};

export const getCounts = (arr: Array<any>) => {
  return arr.reduce((acc, value) => {
    if (value in acc) {
      acc[value] += 1;
    } else {
      acc[value] = 1;
    }
    return acc;
  }, {});
};

export const getRelativePercentages = (arr: Array<any>) => {
  const counts = getCounts(arr);
  const total = arr.length;

  return [...new Set(arr)].reduce((acc, value) => {
    acc[value] = ((counts[value] || 0) / total) * 100;
    return acc;
  }, {});
};
