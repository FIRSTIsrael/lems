import crypto from 'crypto';
import { EventUser as DbEventUser, Division, EventUser } from '@lems/database';
import { VolunteerUser } from '@lems/types/api/admin';
import db from '../../../../lib/database';

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

export const getRoleInfoMapping = async (divisions: Division[]): Promise<Record<string, string>> => {
  const roleInfoMapping: Record<string, string> = {};
  
  divisions.forEach(division => {
    roleInfoMapping[division.id] = division.name;
  });

  await Promise.all(divisions.map(async division => {
    const [rooms, tables] = await Promise.all([
      db.rooms.byDivisionId(division.id).getAll(),
      db.tables.byDivisionId(division.id).getAll()
    ]);

    rooms.forEach(room => {
      roleInfoMapping[room.id] = room.name;
    });

    tables.forEach(table => {
      roleInfoMapping[table.id] = table.name;
    });
  }));

  return roleInfoMapping;
}

export const getDivisionNamesString = (divisionIds: string[], infoMapping: Record<string, string>) : string => {
  return divisionIds.map(id => infoMapping[id] || id).join('; ');
}

const parseRoleInfo = (roleInfo: Record<string, unknown>, infoMapping: Record<string, string>): string => {
  if (!roleInfo) return null;
  Object.entries(roleInfo).map(([key, value]) => {
    if (typeof value === 'string' && infoMapping[value]) {
      roleInfo[key] = infoMapping[value];
    }
  });
  return JSON.stringify(roleInfo);
}

export const formatVolunteerInfo = (user: EventUser & { divisions: string[] }, infoMapping: Record<string, string>) : string => {
  return `${user.role || ''},${getDivisionNamesString(user.divisions, infoMapping)},${user.identifier || ''},${parseRoleInfo(user.role_info, infoMapping)},${user.password}`;
}
