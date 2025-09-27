import { v4 as uuidv4 } from 'uuid';
import { VolunteerUser } from '@lems/types/api/admin';
import { VolunteerSlot, Role } from '../../types';

export const transformVolunteerUsersToSlots = (volunteers: VolunteerUser[]): VolunteerSlot[] => {
  return volunteers.map(volunteer => ({
    id: volunteer.id,
    role: volunteer.role as Role,
    divisions: volunteer.divisions,
    identifier: volunteer.identifier
  }));
};

export const transformVolunteerSlotsToUsers = (
  slots: VolunteerSlot[],
  eventId: string
): Omit<VolunteerUser, 'id'>[] => {
  return slots.map(slot => ({
    eventId,
    role: slot.role,
    divisions: slot.divisions,
    identifier: slot.identifier || null,
    roleInfo: null
  }));
};

export const createNewVolunteerSlot = (
  role: Role,
  divisions: string[] = [],
  identifier?: string
): VolunteerSlot => ({
  id: uuidv4(),
  role,
  divisions,
  identifier
});
