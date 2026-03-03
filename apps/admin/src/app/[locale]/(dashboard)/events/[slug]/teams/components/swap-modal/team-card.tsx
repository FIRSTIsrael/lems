import { Card, Box, Typography, Divider, useTheme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { TeamWithDivision } from '@lems/types/api/admin';

interface TeamCardProps {
  teamData: TeamWithDivision;
  label: string;
  isAfter?: boolean;
}

export const TeamCard = ({ teamData, label, isAfter }: TeamCardProps) => {
  const theme = useTheme();

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
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            fontSize: '1.5rem',
            mb: 0.5
          }}
        >
          #{teamData.number}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {teamData.name}
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

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
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {teamData.division.name}
      </Typography>
    </Card>
  );
};
