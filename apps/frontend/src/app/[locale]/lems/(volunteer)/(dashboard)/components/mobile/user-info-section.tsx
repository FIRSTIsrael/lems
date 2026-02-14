import { useRoleTranslations } from '@lems/localization';
import { Stack, Typography } from '@mui/material';
import { useUser } from '../../../components/user-context';
import { useEvent } from '../../../components/event-context';
import { DivisionSwitcher } from './division-switcher';

export const UserInfoSection = () => {
  const user = useUser();
  const event = useEvent();
  const { getRole } = useRoleTranslations();

  return (
    <Stack sx={{ flex: 1, minWidth: 0, ml: 1 }}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 500,
          fontSize: '0.7rem',
          opacity: 0.9,
          textTransform: 'uppercase',
          letterSpacing: 0.5
        }}
      >
        {getRole(user.role)}
      </Typography>
      <Stack direction="row" spacing={1.5} alignItems="flex-end">
        <Typography
          variant="body2"
          pb={0.25}
          sx={{
            fontWeight: 600,
            fontSize: '0.85rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
          title={event.eventName}
        >
          {event.eventName}
        </Typography>

        <DivisionSwitcher />
      </Stack>
    </Stack>
  );
};
