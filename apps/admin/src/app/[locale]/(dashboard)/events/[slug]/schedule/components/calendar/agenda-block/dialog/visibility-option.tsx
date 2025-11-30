'use client';

import React from 'react';
import { Box, FormControlLabel, Radio, Stack, Typography, useTheme } from '@mui/material';
import { AgendaBlockVisibility } from '../../calendar-types';

interface VisibilityOptionProps {
  value: AgendaBlockVisibility;
  isSelected: boolean;
  label: string;
  description: string;
}

export const VisibilityOption: React.FC<VisibilityOptionProps> = ({
  value,
  isSelected,
  label,
  description
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: 1.5,
        border: `1px solid ${isSelected ? theme.palette.primary.main : theme.palette.divider}`,
        borderRadius: 1,
        backgroundColor: isSelected
          ? `${theme.palette.primary.main}08`
          : theme.palette.background.paper,
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        '&:hover': {
          borderColor: theme.palette.primary.main,
          backgroundColor: `${theme.palette.primary.main}04`
        }
      }}
    >
      <FormControlLabel
        value={value}
        control={<Radio size="small" />}
        label={
          <Stack spacing={0.5} sx={{ ml: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {label}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {description}
            </Typography>
          </Stack>
        }
      />
    </Box>
  );
};
