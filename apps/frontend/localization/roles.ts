import { Role, RoleAssociationType, DivisionSection } from '@lems/types';

export const localizedRoles: { [key in Role]: { name: string } } = {
  'audience-display': { name: 'תצוגת קהל' },
  reports: { name: 'דוחות' },
  'head-referee': { name: 'שופט זירה ראשי' },
  judge: { name: 'שופט חדר' },
  'lead-judge': { name: 'שופט מוביל' },
  'judge-advisor': { name: 'שופט ראשי' },
  'pit-admin': { name: 'פיט אדמין' },
  referee: { name: 'שופט זירה' },
  scorekeeper: { name: 'סקורקיפר' },
  queuer: { name: 'קיואר' },
  'head-queuer': { name: 'קיואר ראשי' },
  'tournament-manager': { name: 'מנהל אירוע' },
  mc: { name: 'מנחה' }
};

export const localizedRoleAssociations: { [key in RoleAssociationType]: { name: string } } = {
  room: { name: 'חדר' },
  table: { name: 'שולחן' },
  category: { name: 'תחום' },
  section: { name: 'מתחם' }
};

export const localizedDivisionSection: {
  [key in DivisionSection]: { name: string };
} = {
  field: { name: 'זירה' },
  judging: { name: 'שיפוט' }
};
