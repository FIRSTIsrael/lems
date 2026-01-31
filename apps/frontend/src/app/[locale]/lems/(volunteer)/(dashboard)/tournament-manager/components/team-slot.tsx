import { Box, Typography } from '@mui/material';

interface TeamSlotProps {
  team: { id: string; number: number; name: string } | null;
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
        bgcolor: isSelected ? 'primary.light' : isSecondSelected ? 'secondary.light' : 'transparent',
        '&:hover': {
          bgcolor: isSelected ? 'primary.light' : isSecondSelected ? 'secondary.light' : 'action.hover'
        },
        transition: 'background-color 0.2s'
      }}
    >
      {team ? (
        <>
          <Typography
            component="span"
            sx={{
              fontSize: isMobile ? '0.7rem' : '0.9rem',
              fontWeight: 600
            }}
          >
            #{team.number}
          </Typography>
          <Typography
            component="span"
            sx={{
              fontSize: isMobile ? '0.65rem' : '0.75rem',
              color: 'text.secondary',
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
        </>
      ) : (
        <Typography variant="caption" color="text.secondary">
          -
        </Typography>
      )}
    </Box>
  );
}
