import { v4 as uuidv4 } from 'uuid';
import { VolunteerUser } from '@lems/types/api/admin';
import { VolunteerSlot, Role } from '../../types';

// Type for lead judge role info containing category
export interface LeadJudgeRoleInfo {
  category: 'robot-design' | 'innovation-project' | 'core-values';
}

export const transformVolunteerUsersToSlots = (
  volunteers: VolunteerUser[]
): {
  slots: VolunteerSlot[];
  toggledSystemRoles: Set<string>;
} => {
  const slots: VolunteerSlot[] = [];
  const toggledSystemRoles = new Set<string>();

  for (const volunteer of volunteers) {
    if (volunteer.role === 'lead-judge') {
      toggledSystemRoles.add('lead-judge');
    } else {
      slots.push({
        id: volunteer.id,
        role: volunteer.role as Role,
        divisions: volunteer.divisions,
        identifier: volunteer.identifier
      });
    }
  }

  return { slots, toggledSystemRoles };
};

export const transformVolunteerSlotsToUsers = (
  slots: VolunteerSlot[],
  eventId: string,
  enabledSystemRoles: Set<string>,
  divisions: Array<{ id: string }>
): Omit<VolunteerUser, 'id' | 'eventId'>[] => {
  const users: Omit<VolunteerUser, 'id' | 'eventId'>[] = [];

  for (const slot of slots) {
    users.push({
      role: slot.role,
      divisions: slot.divisions,
      identifier: slot.identifier || null,
      roleInfo: null
    });
  }

  if (enabledSystemRoles.has('lead-judge')) {
    const categories: string[] = ['core-values', 'innovation-project', 'robot-design'];

    for (const division of divisions) {
      for (const category of categories) {
        users.push({
          role: 'lead-judge',
          divisions: [division.id],
          identifier: null,
          roleInfo: { category }
        });
      }
    }
  }

  return users;
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
