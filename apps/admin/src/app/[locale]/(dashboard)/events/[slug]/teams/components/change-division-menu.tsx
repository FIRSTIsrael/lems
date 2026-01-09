'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  Menu,
  Paper,
  Box,
  Typography,
  Chip,
  Stack
} from '@mui/material';
import { Division, TeamWithDivision } from '@lems/types/api/admin';

interface ChangeDivisionMenuProps {
  anchorEl: null | HTMLElement;
  open: boolean;
  onClose: () => void;
  divisions: Division[];
  selectedTeam: TeamWithDivision | null;
  onSelectDivision: (divisionId: string) => void;
}

export const ChangeDivisionMenu: React.FC<ChangeDivisionMenuProps> = ({
  anchorEl,
  open,
  onClose,
  divisions,
  selectedTeam,
  onSelectDivision
}) => {
  const t = useTranslations('pages.events.teams.unified');

  const handleChipClick = (divisionId: string) => {
    onSelectDivision(divisionId);
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          minWidth: 200,
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }
      }}
      transformOrigin={{ horizontal: 'left', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
    >
      <Box sx={{ p: 3 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            color: 'text.secondary',
            mb: 2,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            fontSize: '0.75rem'
          }}
        >
          {t('menu.selectDivision')}
        </Typography>
        <Stack spacing={1.5}>
          {divisions.map(division => (
            <Chip
              key={division.id}
              label={division.name}
              onClick={() => handleChipClick(division.id)}
              onDelete={undefined}
              variant={division.id === selectedTeam?.division.id ? 'filled' : 'outlined'}
              sx={{
                backgroundColor: division.id === selectedTeam?.division.id ? division.color : 'transparent',
                color: division.id === selectedTeam?.division.id ? 'white' : division.color,
                borderColor: division.color,
                borderWidth: 2,
                fontWeight: 500,
                fontSize: '0.95rem',
                height: 36,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '& .MuiChip-label': {
                  px: 2
                },
                '&:hover': {
                  backgroundColor: division.id === selectedTeam?.division.id ? division.color : `${division.color}15`,
                  borderColor: division.color,
                  boxShadow: `0 2px 8px ${division.color}30`
                }
              }}
            />
          ))}
        </Stack>
      </Box>
    </Menu>
  );
};

