'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Stack,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Save as SaveIcon } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { Division } from '@lems/types/api/admin';
import { Role } from '@lems/types';
import { useEvent } from '../../components/event-context';
import { RoleAssignmentSection } from './role-assignment-section';

// Define mandatory and optional roles based on requirements
const MANDATORY_ROLES: Role[] = [
  'pit-admin',
  'judge',
  'lead-judge',
  'judge-advisor',
  'referee',
  'head-referee',
  'scorekeeper'
];

const OPTIONAL_ROLES: Role[] = [
  'head-queuer',
  'queuer',
  'mc',
  'field-manager',
  'audience-display',
  'reports',
  'tournament-manager'
];

export interface VolunteerAssignment {
  id: string;
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  role: Role;
  divisions: string[];
  identifier?: string;
}

export function VolunteerUsersSection() {
  const event = useEvent();
  const t = useTranslations('pages.events.users.sections.volunteerUsers');

  const [assignments, setAssignments] = useState<VolunteerAssignment[]>([]);
  const [saving, setSaving] = useState(false);

  const { data: divisions = [] } = useSWR<Division[]>(`/admin/events/${event.id}/divisions`);
  const { data: currentAssignments = [] } = useSWR<VolunteerAssignment[]>(
    `/admin/events/${event.id}/volunteers`
  );

  // Initialize assignments from existing data
  useEffect(() => {
    if (currentAssignments.length > 0) {
      setAssignments(currentAssignments);
    }
  }, [currentAssignments]);

  // Validation logic using useMemo to prevent infinite re-renders
  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    if (divisions.length > 1) {
      // Check each division has all mandatory roles
      divisions.forEach(division => {
        MANDATORY_ROLES.forEach(role => {
          const hasRoleInDivision = assignments.some(
            assignment => assignment.role === role && assignment.divisions.includes(division.id)
          );

          if (!hasRoleInDivision) {
            errors.push(
              t('validation.missingMandatoryRole', {
                role: t(`roles.${role}`),
                division: division.name
              })
            );
          }
        });
      });
    } else if (divisions.length === 1) {
      // For single division, just check that all mandatory roles are assigned
      MANDATORY_ROLES.forEach(role => {
        const hasRole = assignments.some(assignment => assignment.role === role);
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
  }, [assignments, divisions, t]);

  const handleAssignmentChange = (newAssignments: VolunteerAssignment[]) => {
    setAssignments(newAssignments);
  };

  const handleSave = async () => {
    if (validationErrors.length > 0) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/events/${event.id}/volunteers`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          assignments
        })
      });

      if (response.ok) {
        // Show success message or redirect
        console.log('Volunteers saved successfully');
      } else {
        console.error('Failed to save volunteers');
      }
    } catch (error) {
      console.error('Error saving volunteers:', error);
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

      {/* Mandatory Roles */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">{t('mandatoryRoles.title')}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('mandatoryRoles.description')}
          </Typography>
          <Stack spacing={3}>
            {MANDATORY_ROLES.map(role => (
              <RoleAssignmentSection
                key={role}
                role={role}
                divisions={divisions}
                assignments={assignments.filter(a => a.role === role)}
                onChange={handleAssignmentChange}
                allAssignments={assignments}
                singleDivision={singleDivision}
              />
            ))}
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Optional Roles */}
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
                assignments={assignments.filter(a => a.role === role)}
                onChange={handleAssignmentChange}
                allAssignments={assignments}
                singleDivision={singleDivision}
              />
            ))}
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Save Button */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={validationErrors.length > 0 || saving}
          size="large"
        >
          {saving ? t('saving') : t('saveAssignments')}
        </Button>
      </Box>
    </Box>
  );
}
