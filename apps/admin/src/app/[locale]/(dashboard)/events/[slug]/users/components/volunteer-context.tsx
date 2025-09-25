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
import { EDITABLE_MANDATORY_ROLES, VolunteerSlot, Role } from '../types';
import { useEvent } from '../../components/event-context';

// Generate initial slots based on divisions (only for editable roles)
const generateInitialSlots = (divisions: Division[]): VolunteerSlot[] => {
  const slots: VolunteerSlot[] = [];

  if (divisions.length === 0) return slots;

  // For single division events, create 1x of each editable mandatory role
  if (divisions.length === 1) {
    EDITABLE_MANDATORY_ROLES.forEach(role => {
      slots.push({
        id: `initial_${role}_${divisions[0].id}`,
        role,
        divisions: [divisions[0].id]
      });
    });
  } else {
    // For multi-division events, create 1x of each editable mandatory role for each division
    divisions.forEach(division => {
      EDITABLE_MANDATORY_ROLES.forEach(role => {
        slots.push({
          id: `initial_${role}_${division.id}`,
          role,
          divisions: [division.id]
        });
      });
    });
  }

  return slots;
};

export interface VolunteerContextType {
  // Data
  divisions: Division[];
  slots: VolunteerSlot[];
  toggledSystemRoles: Set<string>;

  // State management
  saving: boolean;
  validationErrors: string[];

  // Actions - General
  setSlots: React.Dispatch<React.SetStateAction<VolunteerSlot[]>>;
  updateSlots: (newSlots: VolunteerSlot[]) => void;
  handleToggleSystemRole: (role: string, enabled: boolean) => void;
  handleSave: () => Promise<void>;

  // Actions - Slot Management
  addSlot: (role: Role) => void;
  removeSlot: (slotId: string) => void;
  updateSlotDivisions: (slotId: string, newDivisions: string[]) => void;
  updateSlotIdentifier: (slotId: string, identifier: string) => void;
  selectAllDivisions: (slotId: string) => void;

  // Utility functions
  getSlotsForRole: (role: Role) => VolunteerSlot[];
  getDuplicatesForDivision: (role: Role, divisionId: string) => VolunteerSlot[];
  needsIdentifiers: (slot: VolunteerSlot) => boolean;

  // Data loading states
  divisionsLoading: boolean;
  slotsLoading: boolean;
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

  const { data: divisions = [], isLoading: divisionsLoading } = useSWR<Division[]>(
    `/admin/events/${event.id}/divisions`
  );

  const { data: currentSlots = [], isLoading: slotsLoading } = useSWR<VolunteerSlot[]>(
    `/admin/events/${event.id}/volunteers/slots`,
    { suspense: true, fallbackData: [] }
  );

  // Initialize slots from existing data
  useEffect(() => {
    if (currentSlots.length > 0 && !initialized.current) {
      setSlots(currentSlots);
      initialized.current = true;
    }
  }, [currentSlots]);

  // Generate initial slots when divisions are loaded but no current slots exist
  useEffect(() => {
    if (divisions.length > 0 && currentSlots.length === 0 && !initialized.current) {
      const initialSlots = generateInitialSlots(divisions);
      setSlots(initialSlots);
      initialized.current = true;
    }
  }, [divisions, currentSlots.length]);

  // Validation logic using useMemo to prevent infinite re-renders
  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    if (divisions.length > 1) {
      // Check each division has all editable mandatory roles
      divisions.forEach(division => {
        EDITABLE_MANDATORY_ROLES.forEach(role => {
          const hasRoleInDivision = slots.some(
            slot => slot.role === role && slot.divisions.includes(division.id)
          );

          if (!hasRoleInDivision) {
            errors.push(
              t('validation.missingMandatoryRole', {
                role: getRole(role),
                division: division.name
              })
            );
          }
        });
      });
    } else if (divisions.length === 1) {
      // For single division, just check that all editable mandatory roles are assigned
      EDITABLE_MANDATORY_ROLES.forEach(role => {
        const hasRole = slots.some(slot => slot.role === role);
        if (!hasRole) {
          errors.push(
            t('validation.missingMandatoryRoleSingle', {
              role: t(`roles.${role}`)
            })
          );
        }
      });
    }

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

  const updateSlots = (newSlots: VolunteerSlot[]) => {
    setSlots(newSlots);
  };

  // Slot Management Functions
  const addSlot = (role: Role) => {
    // Generate a simple ID for the new slot
    const newId = `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
    // Check if "Select All" (empty string) was clicked
    if (newDivisions.includes('')) {
      selectAllDivisions(slotId);
      return;
    }

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

  const selectAllDivisions = (slotId: string) => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot) return;

    const allDivisionIds = divisions.map(d => d.id);

    // If ANY divisions are selected, deselect all. If NONE are selected, select all.
    const newDivisions = slot.divisions.length > 0 ? [] : allDivisionIds;

    const updatedSlots = slots.map(s => (s.id === slotId ? { ...s, divisions: newDivisions } : s));
    setSlots(updatedSlots);
  };

  // Utility Functions
  const getSlotsForRole = (role: Role): VolunteerSlot[] => {
    return slots.filter(s => s.role === role);
  };

  const getDuplicatesForDivision = (role: Role, divisionId: string): VolunteerSlot[] => {
    const roleSlots = getSlotsForRole(role);
    return roleSlots.filter(slot => slot.divisions.includes(divisionId));
  };

  const needsIdentifiers = (slot: VolunteerSlot): boolean => {
    return slot.divisions.some(divisionId => {
      const duplicatesInDivision = getDuplicatesForDivision(slot.role, divisionId);
      return duplicatesInDivision.length > 1;
    });
  };

  const contextValue: VolunteerContextType = {
    // Data
    divisions,
    slots,
    toggledSystemRoles,

    // State management
    saving,
    validationErrors,

    // Actions - General
    setSlots,
    updateSlots,
    handleToggleSystemRole,
    handleSave,

    // Actions - Slot Management
    addSlot,
    removeSlot,
    updateSlotDivisions,
    updateSlotIdentifier,
    selectAllDivisions,

    // Utility functions
    getSlotsForRole,
    getDuplicatesForDivision,
    needsIdentifiers,

    // Data loading states
    divisionsLoading,
    slotsLoading
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
