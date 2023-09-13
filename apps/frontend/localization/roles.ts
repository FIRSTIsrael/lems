import { Role, RoleAssociationType } from '@lems/types';

export const localizedRoles: { [key in Role]: { name: string } } = {
  audience: { name: 'קהל' },
  display: { name: 'תצוגה' },
  'head-referee': { name: 'שופט זירה ראשי' },
  judge: { name: 'שופט תחום' },
  'lead-judge': { name: 'שופט מוביל' },
  'judge-advisor': { name: 'שופט ראשי' },
  'pit-admin': { name: 'פיט אדמין' },
  referee: { name: 'שופט זירה' },
  scorekeeper: { name: 'סקורקיפר' },
  'tournament-manager': { name: 'מנהל אירוע' }
};

export const localizedRoleAssociations: { [key in RoleAssociationType]: { name: string } } = {
  room: { name: 'חדר' },
  table: { name: 'שולחן' },
  category: { name: 'תחום' }
};
