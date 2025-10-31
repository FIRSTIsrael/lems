import { EventUser } from '@lems/database';
import { LemsUser } from '@lems/types/api/lems';

/**
 * Transforms an EventUser database record into a safe LemsUser response object.
 * This function excludes sensitive fields like password and converts database
 * field names to camelCase for the API response.
 *
 * @param user - The EventUser record from the database
 * @returns A LemsUser object safe for API responses (without password)
 */
export function makeLemsUserResponse(user: EventUser): LemsUser {
  return {
    id: user.id,
    eventId: user.event_id,
    role: user.role,
    identifier: user.identifier,
    roleInfo: user.role_info
  };
}
