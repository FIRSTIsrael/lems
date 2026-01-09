import { VolunteerUser } from '@lems/types/api/admin';
import { VolunteerSlot, Role, SYSTEM_MANAGED_ROLES, SystemManagedRole } from '../../types';

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
    } else if (SYSTEM_MANAGED_ROLES.includes(volunteer.role as SystemManagedRole)) {
      // System-managed roles (judge, referee, audience-display) - skip
      continue;
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
  enabledSystemRoles: Set<string>,
  divisions: Array<{ id: string }>
): Omit<VolunteerUser, 'id' | 'eventId'>[] => {
  const users: Omit<VolunteerUser, 'id' | 'eventId'>[] = [];

  for (const slot of slots) {
    if (SYSTEM_MANAGED_ROLES.includes(slot.role as SystemManagedRole)) {
      // These roles are managed by the system
      continue;
    }

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

  // Auto-generate audience-display (always enabled, 1 per division)
  for (const division of divisions) {
    users.push({
      role: 'audience-display',
      divisions: [division.id],
      identifier: null,
      roleInfo: null
    });
  }

  return users;
};
