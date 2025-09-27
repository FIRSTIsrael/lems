import { EventUser as DbEventUser } from '@lems/database';
import { VolunteerUser } from '@lems/types/api/admin';

/**
 * Generates a 4 charachter uppercase password suitable for volunteer users.
 */
export const generateVolunteerPassword = () => {
  return Math.random().toString(36).slice(-4).toUpperCase();
};

export const makeAdminVolunteerResponse = (
  user: DbEventUser & { divisions: string[] }
): VolunteerUser => ({
  id: user.id,
  eventId: user.event_id,
  role: user.role,
  identifier: user.identifier,
  roleInfo: user.role_info,
  divisions: user.divisions
});
