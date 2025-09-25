'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { Box, Typography, Stack, Alert, Button } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { Division } from '@lems/types/api/admin';
import { useRoleTranslations } from '@lems/localization';
import { EDITABLE_MANDATORY_ROLES, VolunteerSlot } from '../types';
import { useEvent } from '../../components/event-context';
import { ManagedRolesSection } from './volunteer-roles/managed-roles';
import { OptionalRolesSection } from './volunteer-roles/optional-roles';
import { MandatoryRolesSection } from './volunteer-roles/mandatory-roles';

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

export function VolunteerUsersSection() {
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

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h5" gutterBottom>
            {t('title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('description')}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={validationErrors.length > 0 || saving}
          size="large"
          sx={{ flexShrink: 0 }}
        >
          {saving ? t('saving') : t('saveSlots')}
        </Button>
      </Box>

      {validationErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('validation.title')}
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="flex-start">
        <ManagedRolesSection
          toggledSystemRoles={toggledSystemRoles}
          onToggleSystemRole={handleToggleSystemRole}
        />
        <MandatoryRolesSection
          divisions={divisions}
          slots={slots}
          onSlotChange={(newSlots: VolunteerSlot[]) => setSlots(newSlots)}
        />
        <OptionalRolesSection
          divisions={divisions}
          slots={slots}
          onSlotChange={(newSlots: VolunteerSlot[]) => setSlots(newSlots)}
        />
      </Stack>
    </Box>
  );
}
