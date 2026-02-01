import { Box, Typography } from '@mui/material';
import { memo } from 'react';

interface TeamSlotProps {
  team: { id: string; number: number; name: string; affiliation?: string; city?: string } | null;
  isSelected: boolean;
  isSecondSelected: boolean;
  isMobile: boolean;
  onClick: () => void;
  isDisabled?: boolean;
}

const getSlotStyles = (isSelected: boolean, isSecondSelected: boolean, isDisabled: boolean) => {
  if (isDisabled) return 'action.disabledBackground';
  if (isSelected) return 'primary.main';
  if (isSecondSelected) return 'rgba(25, 118, 210, 0.3)';
  return 'transparent';
};

const getTextColor = (
  isSelected: boolean,
  isSecondSelected: boolean,
  isDisabled: boolean,
  textType: 'primary' | 'secondary' = 'primary'
) => {
  if (isDisabled) return 'text.secondary';
  if (isSelected) return textType === 'primary' ? 'white' : 'rgba(255,255,255,0.9)';
  if (isSecondSelected) return textType === 'primary' ? 'primary.main' : 'primary.dark';
  return textType === 'primary' ? 'text.primary' : 'text.secondary';
};

export function TeamSlotComponent({
  team,
  isSelected,
  isSecondSelected,
  isMobile,
  onClick,
  isDisabled = false
}: TeamSlotProps) {
  const handleClick = () => {
    if (!isDisabled) onClick();
  };

  const bgColor = getSlotStyles(isSelected, isSecondSelected, isDisabled);
  const fontSize = isMobile ? '0.7rem' : '0.9rem';
  const secondaryFontSize = isMobile ? '0.65rem' : '0.75rem';
  const tertiaryFontSize = isMobile ? '0.6rem' : '0.7rem';

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
        bgcolor: bgColor,
        opacity: isDisabled ? 0.5 : 1,
        '&:hover': { bgcolor: bgColor },
        transition: 'background-color 0.2s, opacity 0.2s'
      }}
    >
      {team ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
          <Typography
            component="span"
            sx={{
              fontSize,
              fontWeight: 600,
              color: getTextColor(isSelected, isSecondSelected, isDisabled)
            }}
          >
            #{team.number}
          </Typography>
          <Typography
            component="span"
            sx={{
              fontSize: secondaryFontSize,
              color: getTextColor(isSelected, isSecondSelected, isDisabled, 'secondary'),
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
                fontSize: tertiaryFontSize,
                color: getTextColor(isSelected, isSecondSelected, isDisabled, 'secondary'),
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
                fontSize: tertiaryFontSize,
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

export const TeamSlot = memo(TeamSlotComponent);
