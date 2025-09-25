'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Box, Typography, Stack, Card, CardHeader, CardContent } from '@mui/material';
import { Division } from '@lems/types/api/admin';
import { OPTIONAL_ROLES, VolunteerSlot } from '../../types';
import { RoleAssignmentSection } from '../role-assignment-section';

interface OptionalRolesSectionProps {
  divisions: Division[];
  slots: VolunteerSlot[];
  onSlotChange: (newSlots: VolunteerSlot[]) => void;
}

export const OptionalRolesSection: React.FC<OptionalRolesSectionProps> = ({
  divisions,
  slots,
  onSlotChange
}) => {
  const t = useTranslations('pages.events.users.sections.volunteerUsers');

  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Card sx={{ height: 'fit-content' }}>
        <CardHeader title={t('optionalRoles.title')} slotProps={{ title: { variant: 'h6' } }} />
        <CardContent>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
            {t('optionalRoles.description')}
          </Typography>
          <Stack spacing={2}>
            {OPTIONAL_ROLES.map(role => (
              <RoleAssignmentSection
                key={role}
                role={role}
                divisions={divisions}
                slots={slots.filter(s => s.role === role)}
                onChange={onSlotChange}
                allSlots={slots}
                initiallyExpanded={false}
              />
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
