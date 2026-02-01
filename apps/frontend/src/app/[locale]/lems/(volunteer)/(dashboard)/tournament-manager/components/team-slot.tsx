import { Box, Typography } from '@mui/material';

interface TeamSlotProps {
  team: { id: string; number: number; name: string; affiliation?: string; city?: string } | null;
  isSelected: boolean;
  isSecondSelected: boolean;
  isMobile: boolean;
  onClick: () => void;
  isDisabled?: boolean;
}

export function TeamSlot({
  team,
  isSelected,
  isSecondSelected,
  isMobile,
  onClick,
  isDisabled
}: TeamSlotProps) {
  const handleClick = () => {
    if (!isDisabled) {
      onClick();
    }
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.25,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        p: 1.5,
        m: 0.5,
        borderRadius: 1,
        minWidth: isMobile ? '80px' : '100px',
        minHeight: isMobile ? '70px' : '85px',
        width: isMobile ? '80px' : '100px',
        height: isMobile ? '70px' : '85px',
        bgcolor: isDisabled
          ? 'action.disabledBackground'
          : isSelected
            ? 'primary.main'
            : isSecondSelected
              ? 'rgba(25, 118, 210, 0.3)'
              : 'transparent',
        opacity: isDisabled ? 0.5 : 1,
        '&:hover': {
          bgcolor: isDisabled
            ? 'action.disabledBackground'
            : isSelected
              ? 'primary.main'
              : isSecondSelected
                ? 'rgba(25, 118, 210, 0.3)'
                : 'action.hover'
        },
        transition: 'background-color 0.2s, opacity 0.2s'
      }}
    >
      {team ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
          <Typography
            component="span"
            sx={{
              fontSize: isMobile ? '0.7rem' : '0.9rem',
              fontWeight: 600,
              color: isSelected ? 'white' : isSecondSelected ? 'primary.main' : 'text.primary'
            }}
          >
            #{team.number}
          </Typography>
          <Typography
            component="span"
            sx={{
              fontSize: isMobile ? '0.65rem' : '0.75rem',
              color: isSelected
                ? 'rgba(255,255,255,0.9)'
                : isSecondSelected
                  ? 'primary.dark'
                  : 'text.secondary',
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
                color: isSelected
                  ? 'rgba(255,255,255,0.8)'
                  : isSecondSelected
                    ? 'primary.dark'
                    : 'text.secondary',
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
                color: isSelected
                  ? 'rgba(255,255,255,0.7)'
                  : isSecondSelected
                    ? 'text.secondary'
                    : 'text.disabled',
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
