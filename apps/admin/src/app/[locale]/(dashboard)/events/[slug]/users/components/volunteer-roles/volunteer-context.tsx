'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
  useMemo
} from 'react';
import { useTranslations } from 'next-intl';
import useSWR, { mutate } from 'swr';
import { apiFetch } from '@lems/shared';
import { useRoleTranslations } from '@lems/localization';
import { Division, VolunteerUser, VolunteerUsersResponseSchema } from '@lems/types/api/admin';
import { useEvent } from '../../../components/event-context';
import { EDITABLE_MANDATORY_ROLES, VolunteerSlot, Role } from '../../types';
import { transformVolunteerUsersToSlots, transformVolunteerSlotsToUsers } from './utils';

const generateInitialSlots = (divisions: Division[]): VolunteerSlot[] => {
  const slots: VolunteerSlot[] = [];

  if (divisions.length === 0) return slots;
  divisions.forEach(division => {
    EDITABLE_MANDATORY_ROLES.forEach(role => {
      slots.push({
        id: `initial_${role}_${division.id}`,
        role,
        divisions: [division.id]
      });
    });
  });

  return slots;
};

export interface VolunteerContextType {
  // Data
  divisions: Division[];
  toggledSystemRoles: Set<string>;

  // State management
  saving: boolean;
  validationErrors: string[];
  loading: boolean;
  isNew: boolean;

  // Actions - General
  handleToggleSystemRole: (role: string, enabled: boolean) => void;
  handleSave: () => Promise<void>;

  // Actions - Slot Management
  addSlot: (role: Role) => void;
  removeSlot: (slotId: string) => void;
  updateSlotDivisions: (slotId: string, newDivisions: string[]) => void;
  updateSlotIdentifier: (slotId: string, identifier: string) => void;

  // Utility functions
  getSlotsForRole: (role: Role) => VolunteerSlot[];
  needsIdentifiers: (slot: VolunteerSlot) => boolean;
  getEventPasswords: () => Promise<void>;
}

const VolunteerContext = createContext<VolunteerContextType | undefined>(undefined);

export interface VolunteerProviderProps {
  children: ReactNode;
}

export const VolunteerProvider: React.FC<VolunteerProviderProps> = ({ children }) => {
  const event = useEvent();
  const t = useTranslations('pages.events.users.sections.volunteerUsers');
  const { getRole } = useRoleTranslations();

  const [isLoadedFromDatabase, setIsLoadedFromDatabase] = useState(false);
  const [slots, setSlots] = useState<VolunteerSlot[]>([]);
  const [saving, setSaving] = useState(false);
  const [toggledSystemRoles, setToggledSystemRoles] = useState<Set<string>>(new Set());
  const initialized = useRef(false);

  const { data: divisions = [] } = useSWR<Division[]>(`/admin/events/${event.id}/divisions`);

  const { data: currentVolunteers = [], isLoading: volunteersLoading } = useSWR<VolunteerUser[]>(
    `/admin/events/${event.id}/users/volunteers`,
    { suspense: false, fallbackData: [] }
  );

  const loading = volunteersLoading || !initialized.current;

  useEffect(() => {
    if (volunteersLoading || initialized.current) {
      return;
    }

    if (currentVolunteers.length > 0) {
      const { slots: transformedSlots, toggledSystemRoles: systemRoles } =
        transformVolunteerUsersToSlots(currentVolunteers);
      setSlots(transformedSlots);
      setToggledSystemRoles(systemRoles);
      initialized.current = true;

      const hasAllMandatoryRoles = divisions.every(division =>
        EDITABLE_MANDATORY_ROLES.every(role =>  transformedSlots.some(s => s.role === role && s.divisions.includes(division.id)))
      );

      setIsLoadedFromDatabase(hasAllMandatoryRoles);
    } else if (divisions.length > 0) {
      const initialSlots = generateInitialSlots(divisions);
      setSlots(initialSlots);
      initialized.current = true;
    }
  }, [currentVolunteers, divisions, volunteersLoading]);

  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    // Check each division has all editable mandatory roles
    divisions.forEach(division => {
      EDITABLE_MANDATORY_ROLES.forEach(role => {
        const hasRoleInDivision = slots.some(
          slot => slot.role === role && slot.divisions.includes(division.id)
        );

        if (!hasRoleInDivision) {
          const errorMessage =
            divisions.length === 1
              ? t('validation.missingMandatoryRoleSingle', {
                  role: getRole(role)
                })
              : t('validation.missingMandatoryRole', {
                  role: getRole(role),
                  division: division.name
                });

          errors.push(errorMessage);
        }
      });
    });

    return errors;
  }, [divisions, slots, t, getRole]);

  const handleToggleSystemRole = (role: string, enabled: boolean) => {
    setToggledSystemRoles(prev => {
      const newSet = new Set(prev);
      if (enabled) {
        newSet.add(role);
      } else {
        newSet.delete(role);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    if (validationErrors.length > 0) {
      return;
    }

    setSaving(true);
    try {
      const transformedVolunteers = transformVolunteerSlotsToUsers(
        slots,
        event.id,
        toggledSystemRoles,
        divisions
      );

      const result = await apiFetch(
        `/admin/events/${event.id}/users/volunteers`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            volunteers: transformedVolunteers
          })
        },
        VolunteerUsersResponseSchema
      );

      if (result.ok) {
        await mutate(`/admin/events/season/${event.seasonId}/summary`);
        console.log('Volunteer slots saved successfully');
      } else {
        console.error('Failed to save volunteer slots:', result.status, result.error);
      }
    } catch (error) {
      console.error('Error saving volunteer slots:', error);
    } finally {
      setSaving(false);
    }
  };

  const addSlot = (role: Role) => {
    const newId = `slot_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const singleDivision = divisions.length === 1;

    const newSlot: VolunteerSlot = {
      id: newId,
      role,
      divisions: singleDivision ? [divisions[0].id] : []
    };

    const updatedSlots = [...slots, newSlot];
    setSlots(updatedSlots);
  };

  const removeSlot = (slotId: string) => {
    const updatedSlots = slots.filter(s => s.id !== slotId);
    setSlots(updatedSlots);
  };

  const updateSlotDivisions = (slotId: string, newDivisions: string[]) => {
    const updatedSlots = slots.map(slot =>
      slot.id === slotId ? { ...slot, divisions: newDivisions } : slot
    );
    setSlots(updatedSlots);
  };

  const updateSlotIdentifier = (slotId: string, identifier: string) => {
    const updatedSlots = slots.map(slot =>
      slot.id === slotId ? { ...slot, identifier: identifier.slice(0, 12) || undefined } : slot
    );
    setSlots(updatedSlots);
  };

  const getSlotsForRole = (role: Role): VolunteerSlot[] => {
    return slots.filter(s => s.role === role);
  };

  const needsIdentifiers = (slot: VolunteerSlot): boolean => {
    return slot.divisions.some(divisionId => {
      const roleSlots = getSlotsForRole(slot.role);
      const duplicatesInDivision = roleSlots.filter(s => s.divisions.includes(divisionId));
      return duplicatesInDivision.length > 1;
    });
  };

  const getEventPasswords = async (): Promise<void> => {
    try {
      const result = await apiFetch(`/admin/events/${event.id}/users/volunteers/passwords`, {
        responseType: 'binary',
        headers: {
          Accept: 'text/csv; charset=utf-8'
        }
      });

      if (result.ok) {
        const text = await (result.data as Blob).text();
        const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `volunteer-passwords-${event.id}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Failed to download passwords:', result.status, result.error);
      }
    } catch (error) {
      console.error('Error downloading passwords:', error);
    }
  };

  const contextValue: VolunteerContextType = {
    // Data
    divisions,
    toggledSystemRoles,

    // State management
    saving,
    validationErrors,
    loading,
    isNew: !isLoadedFromDatabase,

    // Actions - General
    handleToggleSystemRole,
    handleSave,

    // Actions - Slot Management
    addSlot,
    removeSlot,
    updateSlotDivisions,
    updateSlotIdentifier,

    // Utility functions
    getSlotsForRole,
    needsIdentifiers,
    getEventPasswords
  };

  return <VolunteerContext.Provider value={contextValue}>{children}</VolunteerContext.Provider>;
};

export const useVolunteer = (): VolunteerContextType => {
  const context = useContext(VolunteerContext);
  if (context === undefined) {
    throw new Error('useVolunteer must be used within a VolunteerProvider');
  }
  return context;
};

export default VolunteerProvider;
