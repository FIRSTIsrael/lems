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
import useSWR from 'swr';
import { Division } from '@lems/types/api/admin';
import { useRoleTranslations } from '@lems/localization';
import { EDITABLE_MANDATORY_ROLES, VolunteerSlot, Role } from '../../types';
import { useEvent } from '../../../components/event-context';

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
}

const VolunteerContext = createContext<VolunteerContextType | undefined>(undefined);

export interface VolunteerProviderProps {
  children: ReactNode;
}

export const VolunteerProvider: React.FC<VolunteerProviderProps> = ({ children }) => {
  const event = useEvent();
  const t = useTranslations('pages.events.users.sections.volunteerUsers');
  const { getRole } = useRoleTranslations();

  const [slots, setSlots] = useState<VolunteerSlot[]>([]);
  const [saving, setSaving] = useState(false);
  const [toggledSystemRoles, setToggledSystemRoles] = useState<Set<string>>(new Set());
  const initialized = useRef(false);

  const { data: divisions = [] } = useSWR<Division[]>(`/admin/events/${event.id}/divisions`);

  const { data: currentSlots = [] } = useSWR<VolunteerSlot[]>(
    `/admin/events/${event.id}/volunteers/slots`,
    { suspense: true, fallbackData: [] }
  );

  useEffect(() => {
    if (currentSlots.length > 0 && !initialized.current) {
      setSlots(currentSlots);
      initialized.current = true;
    }
  }, [currentSlots]);

  useEffect(() => {
    if (divisions.length > 0 && currentSlots.length === 0 && !initialized.current) {
      const initialSlots = generateInitialSlots(divisions);
      setSlots(initialSlots);
      initialized.current = true;
    }
  }, [divisions, currentSlots.length]);

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
      const response = await fetch(`/api/admin/events/${event.id}/volunteers/slots`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          slots,
          enabledSystemRoles: Array.from(toggledSystemRoles)
        })
      });

      if (response.ok) {
        // Show success message or redirect
        console.log('Volunteer slots saved successfully');
      } else {
        console.error('Failed to save volunteer slots');
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

  // Utility Functions
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

  const contextValue: VolunteerContextType = {
    // Data
    divisions,
    toggledSystemRoles,

    // State management
    saving,
    validationErrors,

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
    needsIdentifiers
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
