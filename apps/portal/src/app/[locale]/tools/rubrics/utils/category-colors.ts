import { JudgingCategory } from '@lems/types';

export const categoryColors: Record<JudgingCategory, { light: string; dark: string }> = {
  'innovation-project': {
    light: '#C7EAFB',
    dark: '#005ba9'
  },
  'robot-design': {
    light: '#CCE7D3',
    dark: '#007533'
  },
  'core-values': {
    light: '#FCD3C1',
    dark: '#d84315'
  }
};

export const getCategoryColor = (
  category: JudgingCategory,
  variant: 'light' | 'dark' = 'light'
) => {
  return categoryColors[category][variant];
};
