'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  Stack,
  Box,
  Typography,
  Button,
  Autocomplete,
  TextField,
  alpha,
  useTheme
} from '@mui/material';
import { PlayArrow, Lock } from '@mui/icons-material';
import { useCategoryDeliberation } from '../deliberation-context';

export function ControlsPanel() {
  const theme = useTheme();
  const t = useTranslations('pages.deliberations.category.controls');
  const { deliberation, teams, startDeliberation } = useCategoryDeliberation();
  const [selectedTeam1, setSelectedTeam1] = useState<string | null>(null);
  const [selectedTeam2, setSelectedTeam2] = useState<string | null>(null);

  const handleStartDeliberation = useCallback(async () => {
    await startDeliberation();
  }, [startDeliberation]);

  const isInProgress = deliberation?.status === 'in-progress';

  const teamOptions = teams.map(t => ({
    label: `${t.number} - ${t.name}`,
    value: t.id
  }));

  return (
    <Stack
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: 1.75,
        gap: 1.5
      }}
    >
      {/* Status Card */}
      <Box
        sx={{
          p: 1.75,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: 'white',
          borderRadius: 1
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.75 }}>
          {t('status')}
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', mb: 1.5, opacity: 0.9 }}>
          {deliberation?.status === 'in-progress' ? t('in-progress') : t('not-started')}
        </Typography>

        {!isInProgress ? (
          <Button
            variant="contained"
            fullWidth
            startIcon={<PlayArrow />}
            onClick={handleStartDeliberation}
            size="small"
            sx={{
              bgcolor: '#fff',
              color: theme.palette.primary.main,
              '&:hover': {
                bgcolor: alpha('#fff', 0.9)
              },
              fontWeight: 600
            }}
          >
            {t('start')}
          </Button>
        ) : (
          <Button
            variant="contained"
            fullWidth
            startIcon={<Lock />}
            size="small"
            sx={{
              bgcolor: '#fff',
              color: theme.palette.primary.main,
              '&:hover': {
                bgcolor: alpha('#fff', 0.9)
              },
              fontWeight: 600
            }}
          >
            {t('lock')}
          </Button>
        )}
      </Box>

      {/* Comparison Card */}
      <Box
        sx={{
          p: 1.75,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.25
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
          {t('compare-teams')}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Autocomplete
            options={teamOptions}
            value={teamOptions.find(o => o.value === selectedTeam1) || null}
            onChange={(_, value) => setSelectedTeam1(value?.value || null)}
            renderInput={params => <TextField {...params} label={t('team-1')} size="small" />}
            size="small"
            fullWidth
          />
          <Autocomplete
            options={teamOptions}
            value={teamOptions.find(o => o.value === selectedTeam2) || null}
            onChange={(_, value) => setSelectedTeam2(value?.value || null)}
            renderInput={params => <TextField {...params} label={t('team-2')} size="small" />}
            size="small"
            fullWidth
          />
        </Box>

        <Button variant="outlined" fullWidth disabled size="small" sx={{ mt: 0.5 }}>
          {t('compare')}
        </Button>
      </Box>
    </Stack>
  );
}
