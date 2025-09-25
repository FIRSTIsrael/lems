'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import {
  Box,
  Typography,
  Stack,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  FormControlLabel,
  Switch
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Save as SaveIcon } from '@mui/icons-material';
import { Division } from '@lems/types/api/admin';
import { useRoleTranslations } from '@lems/localization';
import {
  EDITABLE_MANDATORY_ROLES,
  SYSTEM_MANAGED_ROLES,
  TOGGLEABLE_SYSTEM_ROLES,
  OPTIONAL_ROLES,
  Role
} from '../types';
import { useEvent } from '../../components/event-context';
import { RoleAssignmentSection } from './role-assignment-section';

export interface VolunteerSlot {
  id: string;
  role: Role;
  divisions: string[];
  identifier?: string;
}

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

  const handleSlotChange = (newSlots: VolunteerSlot[]) => {
    setSlots(newSlots);
  };

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

  const singleDivision = divisions.length === 1;

  return (
    <Box>
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
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

      {/* System-Managed Roles Section */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">{t('systemManagedRoles.title')}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Alert severity="info" sx={{ mb: 2 }}>
            {t('systemManagedRoles.description')}
          </Alert>
          <Stack spacing={2}>
            {/* Always required system roles */}
            {SYSTEM_MANAGED_ROLES.map(role => (
              <Box
                key={role}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'grey.50'
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  {getRole(role)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  {t('systemManagedRoles.roleDescription')}
                </Typography>
              </Box>
            ))}

            {/* Toggleable system roles */}
            {TOGGLEABLE_SYSTEM_ROLES.map(role => (
              <Box
                key={role}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'grey.50'
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" color="text.secondary">
                      {getRole(role)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      {t('systemManagedRoles.toggleableRoleDescription')}
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={toggledSystemRoles.has(role)}
                        onChange={e => handleToggleSystemRole(role, e.target.checked)}
                      />
                    }
                    label={
                      toggledSystemRoles.has(role)
                        ? t('systemManagedRoles.enabled')
                        : t('systemManagedRoles.disabled')
                    }
                  />
                </Stack>
              </Box>
            ))}
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">{t('mandatoryRoles.title')}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('mandatoryRoles.description')}
          </Typography>
          <Stack spacing={3}>
            {EDITABLE_MANDATORY_ROLES.map(role => (
              <RoleAssignmentSection
                key={role}
                role={role}
                divisions={divisions}
                slots={slots.filter(s => s.role === role)}
                onChange={handleSlotChange}
                allSlots={slots}
                singleDivision={singleDivision}
              />
            ))}
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">{t('optionalRoles.title')}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('optionalRoles.description')}
          </Typography>
          <Stack spacing={3}>
            {OPTIONAL_ROLES.map(role => (
              <RoleAssignmentSection
                key={role}
                role={role}
                divisions={divisions}
                slots={slots.filter(s => s.role === role)}
                onChange={handleSlotChange}
                allSlots={slots}
                singleDivision={singleDivision}
              />
            ))}
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={validationErrors.length > 0 || saving}
          size="large"
        >
          {saving ? t('saving') : t('saveSlots')}
        </Button>
      </Box>
    </Box>
  );
}
