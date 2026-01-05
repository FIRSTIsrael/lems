'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Typography,
  TextField,
  Autocomplete
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { useEvent } from '../../../components/event-context';
import { usePageData } from '../../../hooks/use-page-data';
import { GET_DIVISION_TEAMS } from '../graphql';
import type { DivisionTeamsData, DivisionTeamsVars } from '../graphql/types';

interface TeamSelectorProps {
  currentTeams: string[];
  compact?: boolean;
}

export function TeamSelector({ currentTeams, compact = false }: TeamSelectorProps) {
  const t = useTranslations('layouts.deliberation.compare');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentDivision } = useEvent();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Get all teams in the division for selection
  const { data: divisionData } = usePageData<
    DivisionTeamsData,
    DivisionTeamsVars,
    DivisionTeamsData
  >(GET_DIVISION_TEAMS, { divisionId: currentDivision.id }, undefined, undefined, {
    refetchIntervalMs: 0
  });

  const allTeams = divisionData?.division?.teams ?? [];
  const availableTeams = allTeams.filter(team => !currentTeams.includes(team.slug));

  const updateTeamsInUrl = (newTeamSlugs: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newTeamSlugs.length > 0) {
      params.set('teams', newTeamSlugs.join(','));
    } else {
      params.delete('teams');
    }
    router.push(`?${params.toString()}`);
  };

  const addTeam = (teamSlug: string) => {
    if (currentTeams.length < 6 && !currentTeams.includes(teamSlug)) {
      updateTeamsInUrl([...currentTeams, teamSlug]);
    }
  };

  const removeTeam = (teamSlug: string) => {
    updateTeamsInUrl(currentTeams.filter(slug => slug !== teamSlug));
  };

  const currentTeamObjects = currentTeams
    .map(slug => allTeams.find(team => team.slug === slug))
    .filter(Boolean);

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          size="medium"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          disabled={currentTeams.length >= 6}
          sx={{ fontSize: '0.9rem', height: 36 }}
        >
          {t('manage-teams')}
        </Button>

        {currentTeamObjects.map(team => (
          <Chip
            key={team.slug}
            label={`#${team.number}`}
            size="medium"
            onDelete={() => removeTeam(team.slug)}
            deleteIcon={<CloseIcon />}
            color="primary"
            variant="outlined"
            sx={{ fontSize: '0.9rem', height: 36 }}
          />
        ))}

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{t('manage-teams')}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {t('select-teams-to-compare')} ({currentTeams.length}/6)
              </Typography>

              <Autocomplete
                options={availableTeams}
                getOptionLabel={team => `#${team.number} - ${team.name}`}
                renderInput={params => (
                  <TextField {...params} label={t('add-team')} placeholder={t('search-teams')} />
                )}
                onChange={(_, team) => {
                  if (team) {
                    addTeam(team.slug);
                  }
                }}
                disabled={currentTeams.length >= 6}
              />

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {t('current-teams')}:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {currentTeamObjects.map(team => (
                    <Chip
                      key={team.slug}
                      label={`#${team.number} - ${team.name}`}
                      onDelete={() => removeTeam(team.slug)}
                      deleteIcon={<CloseIcon />}
                      color="primary"
                    />
                  ))}
                  {currentTeams.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      {t('no-teams-selected')}
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>{t('done')}</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        {t('manage-teams')}
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          disabled={currentTeams.length >= 6}
        >
          {t('add-team')}
        </Button>

        {currentTeamObjects.map(team => (
          <Chip
            key={team.slug}
            label={`#${team.number} - ${team.name}`}
            onDelete={() => removeTeam(team.slug)}
            deleteIcon={<CloseIcon />}
            color="primary"
          />
        ))}
      </Stack>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('manage-teams')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {t('select-teams-to-compare')} ({currentTeams.length}/6)
            </Typography>

            <Autocomplete
              options={availableTeams}
              getOptionLabel={team => `#${team.number} - ${team.name}`}
              renderInput={params => (
                <TextField {...params} label={t('add-team')} placeholder={t('search-teams')} />
              )}
              onChange={(_, team) => {
                if (team) {
                  addTeam(team.slug);
                }
              }}
              disabled={currentTeams.length >= 6}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t('done')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
