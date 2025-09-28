import { EventUser as DbEventUser } from '@lems/database';
import { VolunteerUser } from '@lems/types/api/admin';
import crypto from 'crypto';

/**
 * Generates a 4 character uppercase password suitable for volunteer users,
 * using cryptographically secure random bytes.
 */
export const generateVolunteerPassword = () => {
  // Allowed characters: uppercase letters and digits
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const passwordLength = 4;
  let password = '';
  const bytes = crypto.randomBytes(passwordLength);
  for (let i = 0; i < passwordLength; i++) {
    // Map each byte to a character in the charset. Avoid bias by using mod.
    password += charset[bytes[i] % charset.length];
  }
  return password;
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
