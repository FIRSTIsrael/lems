import type { Edition } from '../edition';

export type RankingStrategy = 'max' | 'average';

/** Submitted scores only. Missing rounds stay out of the average; a stored 0 still counts. */
const scoredValues = (scores: (number | null | undefined)[]): number[] =>
  scores.filter((score): score is number => score != null);

const average = (scores: number[]) => scores.reduce((sum, score) => sum + score, 0) / scores.length;

export const getRankingStrategy = (edition: Edition): RankingStrategy =>
  edition === 'future' ? 'average' : 'max';

const compareByMax = (
  scoresA: (number | null | undefined)[],
  scoresB: (number | null | undefined)[]
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
  a: (number | null | undefined)[],
  b: (number | null | undefined)[],
  strategy: RankingStrategy,
  reverse = false
): number => {
  let difference: number;

  if (strategy === 'average') {
    const scoredA = scoredValues(a);
    const scoredB = scoredValues(b);
    const avgA = scoredA.length > 0 ? average(scoredA) : 0;
    const avgB = scoredB.length > 0 ? average(scoredB) : 0;
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

/**
 * Index `i` is round `i + 1`. Rounds with no submitted score stay `undefined`
 * so they are shown as blank and left out of an average.
 */
export const indexScoresByRound = (
  scoresByRound: Array<{ round: number; score: number }>,
  roundCount: number
): (number | undefined)[] => {
  const indexed = new Array<number | undefined>(Math.max(roundCount, 0)).fill(undefined);
  for (const { round, score } of scoresByRound) {
    if (round >= 1 && round <= roundCount) {
      indexed[round - 1] = score;
    }
  }
  return indexed;
};

/**
 * Ranking columns cover every scheduled ranking round. Other stages cover
 * only rounds that already have a scoresheet, so practice is not padded out
 * to the ranking schedule.
 */
export const getScoreboardRoundCount = (
  stage: string,
  rankingRoundCount: number,
  roundsInStage: number[]
): number => {
  if (stage === 'RANKING' && rankingRoundCount > 0) return rankingRoundCount;
  return roundsInStage.reduce((max, round) => Math.max(max, round), 0);
};

/** Competition place: 1 is best. Identical score vectors share a place. */
export const getRobotGameRank = (
  scores: (number | null | undefined)[],
  allScores: (number | null | undefined)[][],
  strategy: RankingStrategy
): number => {
  const betterCount = allScores.filter(
    other => compareRobotGameScores(scores, other, strategy) > 0
  ).length;
  return betterCount + 1;
};

export const formatHeadlineScore = (score: number, strategy: RankingStrategy): string =>
  strategy === 'average' ? score.toFixed(2) : String(score);

export const getRobotGameHeadlineScore = (
  scores: (number | null | undefined)[],
  strategy: RankingStrategy
): number => {
  const scored = scoredValues(scores);
  if (scored.length === 0) return 0;
  return strategy === 'average' ? average(scored) : Math.max(...scored);
};
