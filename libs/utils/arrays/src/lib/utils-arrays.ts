export const ensureArray = (value: any | Array<any>) => {
  return Array.isArray(value) ? value : [value];
};

export const reorder = (arr: Array<any>, startIndex: number, endIndex: number) => {
  const result = [...arr];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export const compareScoreArrays = (
  scoresA: (number | undefined)[],
  scoresB: (number | undefined)[]
) => {
  const sortedA = [...scoresA].sort((a, b) => (b || 0) - (a || 0));
  const sortedB = [...scoresB].sort((a, b) => (b || 0) - (a || 0));
  const maxLen = Math.max(scoresA.length, scoresB.length);

  let difference = 0;
  // iterate over the scores until we find a difference
  for (let i = 0; i < maxLen && difference == 0; i++) {
    difference = (sortedB[i] || 0) - (sortedA[i] || 0);
  }
  return difference;
};

export const range = (n: number) => [...Array(n).keys()];

export const average = (arr: Array<number>) => {
  return arr.reduce((acc, value) => acc + value, 0) / arr.length;
};

export const getRelativePercentages = (arr: Array<any>) => {
  const counts = arr.reduce((acc, value) => {
    if (value in acc) {
      acc[value] += 1;
    } else {
      acc[value] = 1;
    }
    return acc;
  }, {});

  const total = arr.length;

  return [...new Set(arr)].reduce((acc, value) => {
    acc[value] = ((counts[value] || 0) / total) * 100;
    return acc;
  }, {});
};
