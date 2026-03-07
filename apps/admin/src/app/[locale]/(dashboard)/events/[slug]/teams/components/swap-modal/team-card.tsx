import { Card, Box, Typography, Divider, useTheme, Avatar, Stack } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { TeamWithDivision, Team as AdminTeam } from '@lems/types/api/admin';
import { Flag } from '@lems/shared';

interface TeamCardProps {
  teamData: TeamWithDivision | AdminTeam;
  label: string;
  isAfter?: boolean;
  showDivision?: boolean;
  seasonEvents?: Array<{ id: string; name: string }>;
}

export const TeamCard = ({
  teamData,
  label,
  isAfter,
  showDivision = true,
  seasonEvents = []
}: TeamCardProps) => {
  const theme = useTheme();
  // Check if teamData has division property (is TeamWithDivision)
  const hasDivision = 'division' in teamData;

  return (
    <Card
      sx={{
        p: 3,
        background: isAfter
          ? `linear-gradient(135deg, ${theme.palette.success.light}20 0%, ${theme.palette.background.paper} 100%)`
          : theme.palette.background.paper,
        border: `2px solid ${isAfter ? theme.palette.success.light : theme.palette.divider}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {isAfter && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            p: 1,
            display: 'flex',
            gap: 0.5
          }}
        >
          <CheckCircleIcon sx={{ fontSize: '1.2rem', color: 'success.main' }} />
        </Box>
      )}

      <Typography
        variant="caption"
        sx={{
          display: 'block',
          textTransform: 'uppercase',
          fontWeight: 700,
          letterSpacing: 0.5,
          color: 'text.secondary',
          mb: 1.5
        }}
      >
        {label}
      </Typography>

      <Box sx={{ mb: 1 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', mb: 1.5 }}>
          <Avatar
            src={teamData.logoUrl || undefined}
            alt={teamData.name}
            sx={{
              width: 56,
              height: 56,
              bgcolor: 'primary.main',
              flexShrink: 0
            }}
          >
            {teamData.number}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                fontSize: '1.25rem'
              }}
            >
              #{teamData.number}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.5 }}>
              {teamData.name}
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <Flag region={teamData.region} size={16} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {teamData.city}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ my: 2 }} />

      {showDivision && hasDivision && (
        <>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              color: 'text.secondary',
              textTransform: 'uppercase',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: 0.5,
              mb: 0.5
            }}
          >
            Division
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 2 }}>
            {(teamData as TeamWithDivision).division.name}
          </Typography>

          <Divider sx={{ my: 2 }} />
        </>
      )}

      <Typography
        variant="caption"
        sx={{
          display: 'block',
          color: 'text.secondary',
          textTransform: 'uppercase',
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: 0.5,
          mb: 0.5
        }}
      >
        Registered Events (This Season)
      </Typography>
      {seasonEvents.length > 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap' }}>
          {seasonEvents.map((event, i) => (
            <div key={event.id}>
              {event.name}
              {i < seasonEvents.length - 1 ? '\n' : ''}
            </div>
          ))}
        </Typography>
      ) : (
        <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
          Not registered to any events
        </Typography>
      )}
    </Card>
  );
};
