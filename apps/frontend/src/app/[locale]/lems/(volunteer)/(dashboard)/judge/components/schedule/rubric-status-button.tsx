'use client';

import { Box, Typography, useTheme } from '@mui/material';
import { JudgingCategory } from '@lems/types/judging';
import { RubricStatus } from '@lems/database';
import { getRubricColor, getRubricIcon } from '@lems/shared/rubrics/rubric-utils';

interface RubricStatusButtonProps {
  category: JudgingCategory;
  status?: RubricStatus;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const RubricStatusButton: React.FC<RubricStatusButtonProps> = ({
  category,
  status = 'empty',
  label,
  onClick,
  disabled = false
}) => {
  const theme = useTheme();
  const rubricColor = getRubricColor(category);
  const statusIcon = getRubricIcon(status, rubricColor);

  const isCompleted = status === 'completed';
  const isDraft = status === 'draft';

  return (
    <Box
      onClick={disabled ? undefined : onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 1.25,
        borderRadius: 2,
        backgroundColor:
          isCompleted || isDraft
            ? theme.palette.mode === 'dark'
              ? `${rubricColor}15`
              : `${rubricColor}08`
            : 'transparent',
        border: '1.5px solid',
        borderColor: isCompleted || isDraft ? rubricColor : theme.palette.divider,
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        minWidth: '140px',
        width: '100%',
        opacity: disabled ? 0.5 : 1,
        ...(!disabled && {
          '&:hover': {
            backgroundColor:
              theme.palette.mode === 'dark' ? `${rubricColor}25` : `${rubricColor}12`,
            borderColor: rubricColor,
            transform: 'translateY(-1px)',
            boxShadow: `0 4px 8px ${rubricColor}20`
          },
          '&:active': {
            transform: 'translateY(0)'
          }
        })
      }}
    >
      {statusIcon}
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          fontSize: '0.875rem',
          color: isCompleted || isDraft ? rubricColor : theme.palette.text.secondary,
          flex: 1,
          textAlign: 'left'
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};
