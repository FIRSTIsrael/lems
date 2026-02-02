import { Box, Button, Typography } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import { memo } from 'react';

const getSlotColors = (isSelected: boolean, isSecondSelected: boolean, isDisabled: boolean) => {
  if (isDisabled) {
    return {
      bg: 'action.disabledBackground',
      primary: 'text.secondary',
      secondary: 'text.secondary',
      tertiary: 'text.secondary'
    };
  }
  if (isSelected) {
    return {
      bg: 'primary.main',
      primary: 'white',
      secondary: 'rgba(255,255,255,0.9)',
      tertiary: 'rgba(255,255,255,0.7)'
    };
  }
  if (isSecondSelected) {
    return {
      bg: 'rgba(25, 118, 210, 0.3)',
      primary: 'primary.main',
      secondary: 'primary.dark',
      tertiary: 'text.secondary'
    };
  }
  return {
    bg: 'transparent',
    primary: 'text.primary',
    secondary: 'text.secondary',
    tertiary: 'text.disabled'
  };
};

interface TeamSlotProps {
  team: {
    id: string;
    number: number;
    name: string;
    affiliation?: string;
    city?: string;
    arrived?: boolean;
  } | null;
  isSelected: boolean;
  isSecondSelected: boolean;
  isMobile: boolean;
  onClick: () => void;
  isDisabled?: boolean;
}

function TeamSlotComponent({
  team,
  isSelected,
  isSecondSelected,
  isMobile,
  onClick,
  isDisabled = false
}: TeamSlotProps) {
  const colors = getSlotColors(isSelected, isSecondSelected, isDisabled);
  const fontSizes = {
    primary: isMobile ? '0.7rem' : '0.9rem',
    secondary: isMobile ? '0.65rem' : '0.75rem',
    tertiary: isMobile ? '0.6rem' : '0.7rem'
  };
  const size = isMobile ? '80px' : '100px';
  const height = isMobile ? '70px' : '85px';

  const textStyle = {
    textAlign: 'center' as const,
    maxWidth: size,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const
  };

  return (
    <Button
      onClick={onClick}
      disabled={isDisabled}
      sx={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.25,
        p: 1.5,
        m: 0.5,
        borderRadius: 1,
        minWidth: size,
        minHeight: height,
        width: size,
        height,
        bgcolor: colors.bg,
        '&:hover': { bgcolor: colors.bg },
        transition: 'background-color 0.2s, opacity 0.2s',
        '&:disabled': {
          opacity: 0.5,
          bgcolor: colors.bg
        }
      }}
    >
      {team ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
            <Typography
              component="span"
              sx={{
                fontSize: fontSizes.primary,
                fontWeight: 600,
                color: colors.primary
              }}
            >
              #{team.number}
            </Typography>
            {team.arrived === false && (
              <BlockIcon
                sx={{
                  fontSize: fontSizes.primary,
                  color: 'error.main',
                  flexShrink: 0
                }}
              />
            )}
          </Box>
          <Typography
            component="span"
            sx={{
              fontSize: fontSizes.secondary,
              color: colors.secondary,
              ...textStyle,
              lineHeight: 1.2
            }}
          >
            {team.name}
          </Typography>
          {team.affiliation && (
            <Typography
              component="span"
              sx={{
                fontSize: fontSizes.tertiary,
                color: colors.secondary,
                ...textStyle,
                lineHeight: 1.1
              }}
            >
              {team.affiliation}
            </Typography>
          )}
          {team.city && (
            <Typography
              component="span"
              sx={{
                fontSize: fontSizes.tertiary,
                color: colors.tertiary,
                ...textStyle,
                lineHeight: 1.1
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
    </Button>
  );
}

export const TeamSlot = memo(TeamSlotComponent);
