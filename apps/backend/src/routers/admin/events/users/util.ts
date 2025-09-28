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
  let count = 0;
  while (count < passwordLength) {
    const byte = crypto.randomBytes(1)[0];
    // Only use bytes less than 252 to ensure uniform distribution for charset length 36
    if (byte >= charset.length * Math.floor(256 / charset.length)) {
      continue;
    }
    password += charset[byte % charset.length];
    count++;
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
