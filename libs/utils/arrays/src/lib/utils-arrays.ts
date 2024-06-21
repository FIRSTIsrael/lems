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
