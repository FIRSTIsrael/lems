import { Box, Typography } from '@mui/material';

interface TeamSlotProps {
  team: { id: string; number: number; name: string; affiliation?: string; city?: string } | null;
  isSelected: boolean;
  isSecondSelected: boolean;
  isMobile: boolean;
  onClick: () => void;
}

export function TeamSlot({ team, isSelected, isSecondSelected, isMobile, onClick }: TeamSlotProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.25,
        cursor: 'pointer',
        p: 0.5,
        borderRadius: 1,
        bgcolor: isSelected ? 'primary.main' : isSecondSelected ? 'info.light' : 'transparent',
        '&:hover': {
          bgcolor: isSelected ? 'primary.main' : isSecondSelected ? 'info.light' : 'action.hover'
        },
        transition: 'background-color 0.2s'
      }}
    >
      {team ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
          <Typography
            component="span"
            sx={{
              fontSize: isMobile ? '0.7rem' : '0.9rem',
              fontWeight: 600,
              color: isSelected || isSecondSelected ? 'white' : 'text.primary'
            }}
          >
            #{team.number}
          </Typography>
          <Typography
            component="span"
            sx={{
              fontSize: isMobile ? '0.65rem' : '0.75rem',
              color: isSelected || isSecondSelected ? 'rgba(255,255,255,0.9)' : 'text.secondary',
              textAlign: 'center',
              lineHeight: 1.2,
              maxWidth: '100px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {team.name}
          </Typography>
          {team.affiliation && (
            <Typography
              component="span"
              sx={{
                fontSize: isMobile ? '0.6rem' : '0.7rem',
                color: isSelected || isSecondSelected ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                textAlign: 'center',
                lineHeight: 1.1,
                maxWidth: '100px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {team.affiliation}
            </Typography>
          )}
          {team.city && (
            <Typography
              component="span"
              sx={{
                fontSize: isMobile ? '0.6rem' : '0.7rem',
                color: isSelected || isSecondSelected ? 'rgba(255,255,255,0.7)' : 'text.disabled',
                textAlign: 'center',
                lineHeight: 1.1,
                maxWidth: '100px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {team.city}
            </Typography>
          )}
        </Box>
      ) : (
        <Typography variant="caption" color="text.secondary">
          -
        </Typography>
      )}
    </Box>
  );
}
