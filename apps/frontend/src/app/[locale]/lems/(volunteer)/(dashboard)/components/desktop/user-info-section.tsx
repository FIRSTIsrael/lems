'use client';

import { Stack, Typography } from '@mui/material';
import { useRoleTranslations } from '@lems/localization';
import { useUser } from '../../../components/user-context';
import { useEvent } from '../../../components/event-context';
import { DivisionSwitcher } from './division-switcher';

export const UserInfoSection = () => {
  const user = useUser();
  const event = useEvent();

  const { getRole } = useRoleTranslations();

  return (
    <Stack spacing={1.25} sx={{ px: 1.5, py: 1.5 }}>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          color: 'text.secondary',
          fontSize: '0.875rem'
        }}
      >
        {getRole(user.role)}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: 'text.primary',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: '0.9rem'
        }}
        title={event.eventName}
      >
        {event.eventName}
      </Typography>

      <DivisionSwitcher />
    </Stack>
  );
};
