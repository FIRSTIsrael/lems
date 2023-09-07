import { Role, RoleAssociationType, JudgingCategory } from '@lems/types';

export const localizeRole = (role: Role): { name: string } => {
  switch (role) {
    case 'audience':
      return { name: 'קהל' };
    case 'display':
      return { name: 'תצוגה' };
    case 'head-referee':
      return { name: 'שופט זירה ראשי' };
    case 'judge':
      return { name: 'שופט תחום' };
    case 'lead-judge':
      return { name: 'שופט מוביל' };
    case 'judge-advisor':
      return { name: 'שופט ראשי' };
    case 'pit-admin':
      return { name: 'פיט אדמין' };
    case 'referee':
      return { name: 'שופט זירה' };
    case 'scorekeeper':
      return { name: 'סקורקיפר' };
    case 'tournament-manager':
      return { name: 'מנהל אירוע' };
  }
};

export const localizeAssociationType = (
  associationType: RoleAssociationType | undefined
): { name: string } => {
  switch (associationType) {
    case 'room':
      return { name: 'חדר' };
    case 'table':
      return { name: 'שולחן' };
    case 'category':
      return { name: 'תחום' };
  }
  return { name: '' };
};

export const localizeJudgingCategory = (category: JudgingCategory): { name: string } => {
  switch (category) {
    case 'innovation-project':
      return { name: 'פרויקט החדשנות' };
    case 'robot-design':
      return { name: 'תכנון הרובוט' };
    case 'core-values':
      return { name: 'ערכי ליבה' };
  }
};
