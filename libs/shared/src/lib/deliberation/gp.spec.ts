import { describe, expect, it } from 'vitest';
import { getEffectiveGp } from './gp';

describe('getEffectiveGp', () => {
  it('returns 3 when gp value is missing (undefined) and team is not a no-show', () => {
    expect(getEffectiveGp(undefined, false, true)).toBe(3);
    expect(getEffectiveGp(undefined, false, false)).toBe(3);
  });

  it('returns 3 when gp value is missing (null) and team is not a no-show', () => {
    expect(getEffectiveGp(null, false, true)).toBe(3);
    expect(getEffectiveGp(null, false, false)).toBe(3);
  });

  it('returns 0 for a no-show when the zero-for-no-shows setting is on', () => {
    expect(getEffectiveGp(undefined, true, true)).toBe(0);
    expect(getEffectiveGp(null, true, true)).toBe(0);
    expect(getEffectiveGp(3, true, true)).toBe(0);
    expect(getEffectiveGp(1, true, true)).toBe(0);
  });

  it('returns the default of 3 for a no-show when the setting is off and no explicit value exists', () => {
    expect(getEffectiveGp(undefined, true, false)).toBe(3);
    expect(getEffectiveGp(null, true, false)).toBe(3);
  });

  it('returns the explicit gp value for a no-show when the setting is off', () => {
    expect(getEffectiveGp(2, true, false)).toBe(2);
    expect(getEffectiveGp(1, true, false)).toBe(1);
  });

  it('returns the explicit gp value when the team is not a no-show, regardless of the setting', () => {
    expect(getEffectiveGp(1, false, true)).toBe(1);
    expect(getEffectiveGp(2, false, false)).toBe(2);
    expect(getEffectiveGp(3, false, true)).toBe(3);
  });

  it('treats an explicit 0 gp value as a real value, not as missing', () => {
    expect(getEffectiveGp(0, false, true)).toBe(0);
    expect(getEffectiveGp(0, false, false)).toBe(0);
    expect(getEffectiveGp(0, true, false)).toBe(0);
  });
});
