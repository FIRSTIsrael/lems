import { Edition } from '../edition';
import { average } from './arrays';

export type RankingStrategy = 'max' | 'average';

/** founders ranks by best single attempt; future ranks by average across attempts. */
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
  // iterate over the scores until we find a difference
  for (let i = 0; i < maxLen && difference === 0; i++) {
    difference = (sortedB[i] || 0) - (sortedA[i] || 0);
  }
  return difference;
};

/**
 * Compares two robot-game score arrays according to the given ranking strategy.
 * - 'max': best single attempt wins, falling back to the next-best attempt on ties.
 * - 'average': highest unrounded average wins, falling back to the 'max' comparison on ties
 *   (missing attempts are treated as zero; two empty arrays compare as equal).
 */
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

/**
 * Pads a team's per-round ranking scores into a fixed-length array indexed by round
 * (index `i` -> round `i + 1`). Rounds with no submitted score (e.g. no-show, not yet
 * played) are filled with `0`. Rounds outside `[1, rankingRoundCount]` are ignored.
 */
export const padRankingScores = (
  scoresByRound: Array<{ round: number; score: number }>,
  rankingRoundCount: number
): number[] => {
  const padded = new Array(Math.max(rankingRoundCount, 0)).fill(0);
  scoresByRound.forEach(({ round, score }) => {
    if (round >= 1 && round <= rankingRoundCount) {
      padded[round - 1] = score;
    }
  });
  return padded;
};

/**
 * Formats a headline score for display, per ranking strategy:
 * - 'average': rounded to 2 decimals (e.g. "123.33"), since the average is rarely a whole number.
 * - 'max': the raw integer score, unrounded.
 * Ranking/sorting must always use the unrounded value (e.g. via `getRobotGameHeadlineScore`/
 * `compareRobotGameScores`); only the on-screen representation is formatted here.
 */
export const formatHeadlineScore = (score: number, strategy: RankingStrategy): string =>
  strategy === 'average' ? score.toFixed(2) : String(score);

/** The single headline number shown for a team's robot game performance, per ranking strategy. */
export const getRobotGameHeadlineScore = (
  scores: (number | undefined)[],
  strategy: RankingStrategy
): number => {
  if (scores.length === 0) return 0;
  const cleaned = scores.map(score => score || 0);
  return strategy === 'average' ? average(cleaned) : Math.max(...cleaned);
};
