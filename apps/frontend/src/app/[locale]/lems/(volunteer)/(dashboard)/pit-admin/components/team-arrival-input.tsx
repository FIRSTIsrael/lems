'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import {
  Box,
  Paper,
  Stack,
  Typography,
  Autocomplete,
  TextField,
  Button,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { Team } from '../pit-admin.graphql';

interface TeamArrivalInputProps {
  teams: Team[];
  onTeamArrival: (team: Team) => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
}

export function TeamArrivalInput({
  teams,
  onTeamArrival,
  loading = false,
  disabled = false
}: TeamArrivalInputProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const t = useTranslations('components.pit-admin.team-input');

  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Filter teams that haven't arrived yet
  const unarrivedTeams = teams.filter(team => !team.arrived);

  const handleMarkArrived = useCallback(async () => {
    if (!selectedTeam) return;

    setSubmitting(true);

    try {
      await onTeamArrival(selectedTeam);
      setSelectedTeam(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('error');
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeam, onTeamArrival]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && selectedTeam && !submitting) {
        e.preventDefault();
        handleMarkArrived();
      }
    },
    [selectedTeam, submitting, handleMarkArrived]
  );

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box sx={{ height: 24, bgcolor: 'action.disabledBackground', borderRadius: 1 }} />
          <Box sx={{ height: 56, bgcolor: 'action.disabledBackground', borderRadius: 1 }} />
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, boxShadow: theme.shadows[2] }}>
      <Stack spacing={2.5}>
        <Stack spacing={0.5}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t('title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('subtitle')}
          </Typography>
        </Stack>

        <Stack
          direction={isMobile ? 'column' : 'row'}
          spacing={2}
          alignItems={isMobile ? 'stretch' : 'flex-end'}
        >
          <Autocomplete
            fullWidth={isMobile}
            sx={{
              flex: isMobile ? undefined : 1,
              '& .MuiOutlinedInput-root': {
                transition: theme.transitions.create(['box-shadow', 'border-color']),
                '&:hover': {
                  boxShadow: theme.shadows[2]
                }
              }
            }}
            options={unarrivedTeams}
            getOptionLabel={team => `Team ${team.number} - ${team.name}`}
            value={selectedTeam}
            onChange={(_event, newValue) => {
              setSelectedTeam(newValue);
            }}
            onKeyDown={handleKeyDown}
            disabled={submitting || disabled}
            noOptionsText={unarrivedTeams.length === 0 ? t('no-options') : 'No teams found'}
            renderInput={params => (
              <TextField
                {...params}
                label={t('search-label')}
                placeholder={t('search-placeholder')}
                slotProps={{
                  input: {
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {submitting && <CircularProgress color="inherit" size={20} />}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }
                }}
              />
            )}
            renderOption={(props, team) => (
              <Box component="li" {...props} key={team.id}>
                <Stack spacing={0.5} width="100%">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Team {team.number}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {team.name}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {team.affiliation} • {team.city}
                  </Typography>
                </Stack>
              </Box>
            )}
            slotProps={{
              paper: {
                sx: {
                  boxShadow: theme.shadows[4],
                  mt: 1
                }
              }
            }}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleMarkArrived}
            disabled={!selectedTeam || submitting || disabled}
            sx={{
              minWidth: isMobile ? undefined : 140,
              height: 56,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              position: 'relative',
              overflow: 'hidden',
              transition: theme.transitions.create(['all']),
              '&:not(:disabled):hover': {
                boxShadow: theme.shadows[6]
              }
            }}
          >
            {submitting ? (
              <Stack direction="row" alignItems="center" spacing={1}>
                <CircularProgress size={20} color="inherit" />
                <span>{t('submitting')}</span>
              </Stack>
            ) : (
              <Stack direction="row" alignItems="center" spacing={1}>
                <CheckCircleIcon sx={{ fontSize: '1.2rem' }} />
                <span>{t('button')}</span>
              </Stack>
            )}
          </Button>
        </Stack>

        {unarrivedTeams.length === 0 && teams.length > 0 && (
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              p: 2,
              bgcolor: 'success.50',
              borderRadius: 1,
              border: `1px solid ${theme.palette.success.light}`,
              alignItems: 'center'
            }}
          >
            <CheckCircleIcon color="success" sx={{ flexShrink: 0 }} />
            <Typography variant="body2" color="success.dark" sx={{ fontWeight: 500 }}>
              {t('all-arrived-message')}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
