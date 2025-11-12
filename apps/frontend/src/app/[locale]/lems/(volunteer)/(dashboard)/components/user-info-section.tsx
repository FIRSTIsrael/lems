'use client';

import { Stack, Typography, Box, useTheme } from '@mui/material';
import { useRoleTranslations } from '@lems/localization';
import { useUser } from '../../../components/user-context';
import { useEvent } from '../../components/event-context';

export const UserInfoSection = () => {
  const theme = useTheme();
  const user = useUser();
  const event = useEvent();

  const { getRole } = useRoleTranslations();

  // Generate a consistent color based on division ID
  const getDivisionColor = (divisionId: string) => {
    const colors = [
      theme.palette.info.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
      theme.palette.secondary.main
    ];
    const hash = divisionId.charCodeAt(0) + divisionId.charCodeAt(divisionId.length - 1);
    return colors[hash % colors.length];
  };

  const divisionColor = getDivisionColor(event.currentDivision.id);
  const displayDivision = !!event.currentDivision.name.trim();

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

      {displayDivision && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: divisionColor,
              flexShrink: 0
            }}
          />
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: 'text.primary',
              fontSize: '0.875rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            title={event.currentDivision.name}
          >
            {event.currentDivision.name}
          </Typography>
        </Box>
      )}
    </Stack>
  );
};
