const THEME_BASE = '/assets/audience-display/theme';

export const AUDIENCE_THEME = {
  skyGradient:
    'linear-gradient(-10.38deg, #ffffff 2.64%, #eff9fc 15.09%, #c6ebf6 21.37%, #85d4ec 54.27%, #68cae8 68.5%)',
  text: '#0b4f3a',
  forest: '#184632',
  grass: '#6EB62C',
  lime: '#a8cf72',
  badgeBg: '#b7d9b7',
  fontFamily: 'var(--font-heebo), Heebo, sans-serif',
  assets: {
    explorer: `${THEME_BASE}/explorer.png`,
    heroPattern: `${THEME_BASE}/hero-pattern.svg`,
    heroBase: `${THEME_BASE}/hero-base.svg`,
    grass1: `${THEME_BASE}/grass-1.svg`,
    grass2: `${THEME_BASE}/grass-2.svg`,
    bushLeft: `${THEME_BASE}/bush-left.svg`,
    bushRight: `${THEME_BASE}/bush-right.svg`,
    treeCanopy: `${THEME_BASE}/tree-canopy.svg`,
    treeRightSmall: `${THEME_BASE}/tree-right-small.svg`,
    usersFour: `${THEME_BASE}/users-four.svg`,
    firstIsrael: `${THEME_BASE}/first-israel.svg`,
    technion: `${THEME_BASE}/technion.svg`,
    legoEducation: `${THEME_BASE}/lego-education.png`,
    joshWeston: `${THEME_BASE}/josh-weston.svg`,
    ministryEducation: `${THEME_BASE}/ministry-education.svg`,
    ministryScience: `${THEME_BASE}/ministry-science.svg`,
    messageExplorer: `${THEME_BASE}/message-explorer.png`,
    messagePanel: `${THEME_BASE}/message-panel.svg`
  }
} as const;
