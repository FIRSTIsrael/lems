import { Edition } from '../edition';

export type RankingStrategy = 'max' | 'average';

const average = (scores: number[]) =>
  scores.reduce((sum, score) => sum + score, 0) / scores.length;

export const getRankingStrategy = (edition: Edition): RankingStrategy =>
  edition === 'future' ? 'average' : 'max';

const compareByMax = (
  scoresA: (number | undefined)[],
  scoresB: (number | undefined)[]
): number => {
  const sortedA = [...scoresA].sort((a, b) => (b || 0) - (a || 0));
  const sortedB = [...scoresB].sort((a, b) => (b || 0) - (a || 0));
  const maxLen = Math.max(scoresA.length, scoresB.length);

  let difference = 0;
  for (let i = 0; i < maxLen && difference === 0; i++) {
    difference = (sortedB[i] || 0) - (sortedA[i] || 0);
  }
  return difference;
};

export const compareRobotGameScores = (
  a: (number | undefined)[],
  b: (number | undefined)[],
  strategy: RankingStrategy,
  reverse = false
): number => {
  let difference: number;

  if (strategy === 'average') {
    const avgA = a.length > 0 ? average(a.map(score => score || 0)) : 0;
    const avgB = b.length > 0 ? average(b.map(score => score || 0)) : 0;
    difference = avgB - avgA;
    if (difference === 0) {
      difference = compareByMax(a, b);
    }
  } else {
    difference = compareByMax(a, b);
  }

  if (reverse) difference *= -1;
  return difference;
};

/** Index `i` is round `i + 1`; missing rounds are `0`. */
export const padRankingScores = (
  scoresByRound: Array<{ round: number; score: number }>,
  rankingRoundCount: number
): number[] => {
  const padded = new Array(Math.max(rankingRoundCount, 0)).fill(0);
  for (const { round, score } of scoresByRound) {
    if (round >= 1 && round <= rankingRoundCount) {
      padded[round - 1] = score;
    }
  }
  return padded;
};

export const formatHeadlineScore = (score: number, strategy: RankingStrategy): string =>
  strategy === 'average' ? score.toFixed(2) : String(score);

export const getRobotGameHeadlineScore = (
  scores: (number | undefined)[],
  strategy: RankingStrategy
): number => {
  if (scores.length === 0) return 0;
  const cleaned = scores.map(score => score || 0);
  return strategy === 'average' ? average(cleaned) : Math.max(...cleaned);
};
