import type { JudgingCategory } from '@lems/types/judging';
import type { Edition } from '../edition';

export interface RubricCategoryColors {
  /** Header background per level column: beginning, developing, accomplished, exceeds. */
  columns: readonly [string, string, string, string];
  /** Section title row background. */
  section: string;
  /** Strong accent colour for chips, icons and borders. */
  main: string;
}

const FOUNDERS_COLORS: Record<JudgingCategory, RubricCategoryColors> = {
  'core-values': {
    columns: ['#FAECEA', '#F3D0C9', '#EBB3AA', '#E4928B'],
    section: '#F5DAD4',
    main: '#d32f2f'
  },
  'innovation-project': {
    columns: ['#E9ECF7', '#BDC6E4', '#90A3D2', '#5E82BF'],
    section: '#D3DAED',
    main: '#1976d2'
  },
  'robot-design': {
    columns: ['#EDF4EC', '#C6DDC5', '#99C69C', '#64AF75'],
    section: '#DAE8D8',
    main: '#388e3c'
  }
};

// Future Edition: Engineering Design is yellow/orange (fll-future-3-8-judging-rubric.pdf).
const FUTURE_COLORS: Record<JudgingCategory, RubricCategoryColors> = {
  ...FOUNDERS_COLORS,
  'robot-design': {
    columns: ['#FDF4E3', '#FAE3B5', '#F6CD7F', '#F0B043'],
    section: '#F9E7C4',
    main: '#f57c00'
  }
};

export const getRubricColors = (
  edition: Edition,
  category: JudgingCategory
): RubricCategoryColors => (edition === 'future' ? FUTURE_COLORS : FOUNDERS_COLORS)[category];
