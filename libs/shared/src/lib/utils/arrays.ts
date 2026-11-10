import { compareRobotGameScores } from './robot-game-ranking';

export const partialMatch = <T>(partial: Partial<T>, full: T): boolean => {
  return Object.keys(partial).every(
    key => JSON.stringify(partial[key as keyof T]) === JSON.stringify(full[key as keyof T])
  );
};

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

export const range = (n: number) => [...Array(n).keys()];

export const average = (arr: Array<number>) => {
  return arr.reduce((acc, value) => acc + value, 0) / arr.length;
};

export const sum = (arr: Array<number>) => {
  return arr.reduce((acc, value) => acc + value, 0);
};

export const compareScoreArrays = (
  scoresA: (number | undefined)[],
  scoresB: (number | undefined)[],
  reverse = false
) => compareRobotGameScores(scoresA, scoresB, 'max', reverse);
