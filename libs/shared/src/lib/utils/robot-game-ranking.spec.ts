import { compareScoreArrays } from './arrays';
import {
  compareRobotGameScores,
  getRankingStrategy,
  getRobotGameHeadlineScore
} from './robot-game-ranking';

describe('getRankingStrategy', () => {
  it('returns max for founders', () => {
    expect(getRankingStrategy('founders')).toBe('max');
  });

  it('returns average for future', () => {
    expect(getRankingStrategy('future')).toBe('average');
  });
});

describe('compareRobotGameScores - max strategy', () => {
  it('matches compareScoreArrays for equivalent inputs', () => {
    const a = [10, 20, 30];
    const b = [15, 25, 5];
    expect(compareRobotGameScores(a, b, 'max')).toBe(compareScoreArrays(a, b));
  });

  it('ranks the higher max score first', () => {
    expect(compareRobotGameScores([10, 50], [10, 40], 'max')).toBeLessThan(0);
  });

  it('falls back to second-highest score on tied max', () => {
    expect(compareRobotGameScores([50, 10], [50, 20], 'max')).toBeGreaterThan(0);
  });

  it('respects the reverse flag', () => {
    const a = [10, 50];
    const b = [10, 40];
    expect(compareRobotGameScores(a, b, 'max', true)).toBe(
      -compareRobotGameScores(a, b, 'max')
    );
  });
});

describe('compareRobotGameScores - average strategy', () => {
  it('ranks the higher average first', () => {
    // avg a = 20, avg b = 15
    expect(compareRobotGameScores([10, 30], [10, 20], 'average')).toBeLessThan(0);
  });

  it('falls back to max-style tiebreak when averages are equal', () => {
    // avg a = avg b = 20, but a has a higher top score
    expect(compareRobotGameScores([40, 0], [20, 20], 'average')).toBeLessThan(0);
  });

  it('compares unrounded averages (no premature rounding)', () => {
    // avg a = 10/3 = 3.333..., avg b = 10/3 - epsilon via zero-padded round
    const a = [10, 0, 0];
    const b = [9, 1, 0];
    // both average to ~3.33, tie should fall through to max tiebreak (a: 10 > b: 9)
    expect(compareRobotGameScores(a, b, 'average')).toBeLessThan(0);
  });

  it('treats missing attempts as zero when computing the average', () => {
    // avg a = (10 + 0) / 2 = 5, avg b = 8 / 1 = 8
    expect(compareRobotGameScores([10, undefined], [8], 'average')).toBeGreaterThan(0);
  });

  it('treats two empty arrays as equal', () => {
    expect(compareRobotGameScores([], [], 'average')).toBe(0);
  });

  it('respects the reverse flag', () => {
    const a = [10, 30];
    const b = [10, 20];
    expect(compareRobotGameScores(a, b, 'average', true)).toBe(
      -compareRobotGameScores(a, b, 'average')
    );
  });
});

describe('getRobotGameHeadlineScore', () => {
  it('returns the max score for max strategy', () => {
    expect(getRobotGameHeadlineScore([10, 50, 30], 'max')).toBe(50);
  });

  it('returns the average score for average strategy', () => {
    expect(getRobotGameHeadlineScore([10, 20, 30], 'average')).toBe(20);
  });

  it('treats undefined scores as zero', () => {
    expect(getRobotGameHeadlineScore([10, undefined], 'average')).toBe(5);
  });

  it('returns 0 for an empty array regardless of strategy', () => {
    expect(getRobotGameHeadlineScore([], 'max')).toBe(0);
    expect(getRobotGameHeadlineScore([], 'average')).toBe(0);
  });
});
