import { Admin as DbAdmin, EventUser as DbEventUser } from '@lems/database';
import { AdminUser, VolunteerUser } from '@lems/types/api/admin';

/**
 * Transforms a user object into a response format.
 * Removes sensitive information and formats the response.
 * @param user - The user object to transform.
 */
export const makeAdminUserResponse = (user: DbAdmin): AdminUser => ({
  id: user.id,
  username: user.username,
  firstName: user.first_name,
  lastName: user.last_name,
  createdAt: user.created_at
});

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
