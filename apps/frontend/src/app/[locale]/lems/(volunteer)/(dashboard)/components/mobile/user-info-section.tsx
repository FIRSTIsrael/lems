import { useRoleTranslations } from '@lems/localization';
import { Stack, Typography, Box } from '@mui/material';
import { useUser } from '../../../../components/user-context';
import { useEvent } from '../../../components/event-context';

export const UserInfoSection = () => {
  const user = useUser();
  const event = useEvent();
  const { getRole } = useRoleTranslations();

  const divisionColor = event.currentDivision.color;
  const displayDivision = !!event.currentDivision.name.trim();

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

        {displayDivision && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              paddingX: 1,
              paddingY: 0.5,
              borderRadius: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.1) inset'
            }}
          >
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
                fontSize: '0.7rem',
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
    </Stack>
  );
};
