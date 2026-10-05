import { describe, it, expect } from 'vitest';
import { futureScoresheet } from './future';
import { calculateScoresheetScore } from './calculate-scoresheet-score';
import { getScoresheet } from './scoresheet';

describe('futureScoresheet', () => {
  it('keeps the summed total with 2 penalties (-30 applied)', () => {
    const r = calculateScoresheetScore(futureScoresheet, {
      m01: { 0: '0', 1: '0', 2: '0', 3: false },
      pt: { 0: '2' }
    });
    expect(r.hasCalculationErrors).toBe(false);
    expect(r.missionScores['pt']).toBe(-30);
    expect(r.total).toBe(r.rawTotal);
    expect(r.scoreOverridden).toBe(false);
  });

  it('scores m02 canopy chamber count times 10 (not capped at 15 pts)', () => {
    const r = calculateScoresheetScore(futureScoresheet, {
      m02: { 0: 0, 1: 2 }
    });
    expect(r.hasCalculationErrors).toBe(false);
    expect(r.missionScores['m02']).toBe(20);
  });

  it('zeroes the total with 3+ penalties', () => {
    const r = calculateScoresheetScore(futureScoresheet, {
      m01: { 0: '3', 1: '3', 2: '3', 3: false },
      pt: { 0: '3+' }
    });
    expect(r.hasCalculationErrors).toBe(false);
    expect(r.rawTotal).toBeGreaterThan(0);
    expect(r.total).toBe(0);
    expect(r.scoreOverridden).toBe(true);
  });
});

describe('getScoresheet', () => {
  it('returns futureScoresheet for the future edition', () => {
    expect(getScoresheet('future')).toBe(futureScoresheet);
  });

  it('leaves founders unchanged', () => {
    const founders = getScoresheet('founders');
    expect(founders).not.toBe(futureScoresheet);
    expect(founders.missions.some(m => m.id === 'luc')).toBe(false);
  });
});
