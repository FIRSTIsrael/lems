'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Box, Chip, Stack, Typography, TextField, Autocomplete } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
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
    .filter((team): team is NonNullable<typeof team> => Boolean(team));

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Autocomplete
          options={availableTeams}
          getOptionLabel={team => `#${team.number} - ${team.name}`}
          renderInput={params => (
            <TextField
              {...params}
              label={t('add-team')}
              placeholder={t('search-teams')}
              size="small"
              sx={{ minWidth: 200 }}
            />
          )}
          onChange={(_, team) => {
            if (team) {
              addTeam(team.slug);
            }
          }}
          disabled={currentTeams.length >= 6}
          value={null}
        />

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
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        {t('manage-teams')}
      </Typography>
      <Stack spacing={2}>
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
          value={null}
        />

        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t('select-teams-to-compare')} ({currentTeams.length}/6)
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
    </Box>
  );
}
