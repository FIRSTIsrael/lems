import { describe, it, expect } from 'vitest';
import { ScoresheetError, type ScoresheetSchema } from './types';
import { calculateScoresheetScore } from './calculate-scoresheet-score';

const miniSchema: ScoresheetSchema = {
  _version: 'test',
  missions: [
    {
      id: 'a',
      clauses: [{ type: 'boolean', default: false }],
      calculation: v => (v ? 10 : 0)
    },
    {
      id: 'b',
      clauses: [{ type: 'boolean', default: false }],
      calculation: () => {
        throw new ScoresheetError('b-err');
      }
    }
  ],
  validators: []
};

describe('calculateScoresheetScore', () => {
  it('sums missions when no finalizeScore', () => {
    const r = calculateScoresheetScore(miniSchema, { a: { 0: true } });
    expect(r.total).toBe(10);
    expect(r.scoreOverridden).toBe(false);
    expect(r.hasCalculationErrors).toBe(false);
  });

  it('skips finalizeScore when a mission calculation errors', () => {
    const schema: ScoresheetSchema = {
      ...miniSchema,
      finalizeScore: () => 0
    };
    const r = calculateScoresheetScore(schema, {
      a: { 0: true },
      b: { 0: true }
    });
    expect(r.hasCalculationErrors).toBe(true);
    expect(r.total).toBe(10);
    expect(r.scoreOverridden).toBe(false);
  });

  it('applies finalizeScore when no calculation errors', () => {
    const schema: ScoresheetSchema = {
      ...miniSchema,
      missions: [miniSchema.missions[0]],
      finalizeScore: ({ total }) => total - 3
    };
    const r = calculateScoresheetScore(schema, { a: { 0: true } });
    expect(r.total).toBe(7);
    expect(r.rawTotal).toBe(10);
    expect(r.scoreOverridden).toBe(true);
  });
});
