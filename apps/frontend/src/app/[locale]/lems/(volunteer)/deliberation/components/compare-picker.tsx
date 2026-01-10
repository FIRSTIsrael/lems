'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Autocomplete, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { CompareArrows } from '@mui/icons-material';

interface CompareTeamsPickerProps {
  teams: { id: string; number: string; name: string }[];
  onCompare?: (team1Id: string, team2Id: string) => void;
}

export function CompareTeamsPicker({ teams, onCompare }: CompareTeamsPickerProps) {
  const t = useTranslations('pages.deliberations.compare');
  const [selectedTeam1, setSelectedTeam1] = useState<string | null>(null);
  const [selectedTeam2, setSelectedTeam2] = useState<string | null>(null);

  const teamOptions = teams.map(t => ({
    label: `${t.number} - ${t.name}`,
    value: t.id
  }));

  const handleCompare = () => {
    if (selectedTeam1 && selectedTeam2) {
      onCompare?.(selectedTeam1, selectedTeam2);
    }
  };

  return (
    <Stack
      component={Paper}
      p={2.5}
      justifyContent="space-between"
      sx={{
        flex: 1,
        border: theme => `1px solid ${theme.palette.divider}`,
        borderRadius: 1.5
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            fontSize: '0.95rem',
            color: 'text.primary',
            letterSpacing: '0.5px'
          }}
        >
          {t('title')}
        </Typography>
        <CompareArrows />
      </Stack>

      <Autocomplete
        options={teamOptions}
        value={teamOptions.find(o => o.value === selectedTeam1) || null}
        onChange={(_, value) => setSelectedTeam1(value?.value || null)}
        renderInput={params => (
          <TextField
            {...params}
            label={t('team-1')}
            size="small"
            variant="outlined"
            slotProps={{
              input: {
                ...params.InputProps,
                sx: {
                  fontSize: '0.875rem'
                }
              }
            }}
          />
        )}
        size="small"
        fullWidth
        noOptionsText={t('no-data-available')}
      />
      <Autocomplete
        options={teamOptions}
        value={teamOptions.find(o => o.value === selectedTeam2) || null}
        onChange={(_, value) => setSelectedTeam2(value?.value || null)}
        renderInput={params => (
          <TextField
            {...params}
            label={t('team-2')}
            size="small"
            variant="outlined"
            slotProps={{
              input: {
                ...params.InputProps,
                sx: {
                  fontSize: '0.875rem'
                }
              }
            }}
          />
        )}
        size="small"
        fullWidth
        noOptionsText={t('no-data-available')}
      />

      <Button
        variant="contained"
        color="primary"
        fullWidth
        disabled={!selectedTeam1 || !selectedTeam2 || selectedTeam1 === selectedTeam2}
        onClick={handleCompare}
        sx={{
          fontWeight: 600,
          textTransform: 'none',
          py: 1
        }}
      >
        {t('compare')}
      </Button>
    </Stack>
  );
}
