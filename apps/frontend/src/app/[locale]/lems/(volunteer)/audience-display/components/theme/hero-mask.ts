export type HeroTrap = { left: number; top: number; width: number; height: number };

const HERO_BASE_OFFSET = 287;
const TOP_UNMASK_OVERLAP = 160;

export const getHeroMask = (trap: HeroTrap, heroPatternUrl: string) => {
  const trapMask = `url(${heroPatternUrl})`;

  return {
    trapMask,
    explorerMask: `linear-gradient(#000, #000), ${trapMask}`,
    topUnmaskH: trap.top + TOP_UNMASK_OVERLAP,
    heroBaseTop: trap.top + HERO_BASE_OFFSET,
    heroBaseMaskPosition: `7px -${HERO_BASE_OFFSET}px`
  };
};
