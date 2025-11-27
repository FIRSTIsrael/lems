import { TicketType } from '@lems/types';

export const localizedTicketTypes: { [key in TicketType]: string } = {
  general: 'בקשה כללית',
  schedule: 'לוחות זמנים',
  utilities: 'הפקה (ציוד, חשמל וכו׳)',
  incident: 'אירוע חריג'
};
