'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Box, Chip, Stack, Typography, TextField, Autocomplete } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import type { DivisionTeam } from '../graphql/types';
import { useCompareContext } from '../compare-context';

interface TeamSelectorProps {
  currentTeams: string[];
  compact?: boolean;
}

interface TeamAutocompleteProps {
  availableTeams: DivisionTeam[];
  addTeam: (slug: string) => void;
  currentTeams: string[];
  t: (key: string) => string;
  size?: 'small' | 'medium';
}

const TeamAutocomplete = ({
  availableTeams,
  addTeam,
  currentTeams,
  t,
  size = 'medium'
}: TeamAutocompleteProps) => (
  <Autocomplete
    options={availableTeams}
    getOptionLabel={team => `#${team.number} - ${team.name}`}
    renderInput={params => (
      <TextField
        {...params}
        label={t('add-team')}
        placeholder={t('search-teams')}
        size={size}
        sx={size === 'small' ? { minWidth: 200 } : {}}
      />
    )}
    onChange={(_, team) => team && addTeam(team.slug)}
    disabled={currentTeams.length >= 6}
    value={null}
  />
);

export const TeamSelector = ({ currentTeams, compact = false }: TeamSelectorProps) => {
  const t = useTranslations('layouts.deliberation.compare');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { allTeams } = useCompareContext();

  const availableTeams = allTeams.filter(team => !currentTeams.includes(team.slug));
  const currentTeamObjects = currentTeams
    .map(slug => allTeams.find(team => team.slug === slug))
    .filter((team): team is DivisionTeam => team !== undefined);

  const updateTeamsInUrl = (newTeamSlugs: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newTeamSlugs.length > 0) {
      params.set('teams', newTeamSlugs.join(','));
    } else {
      params.delete('teams');
    }
    router.push(`?${params.toString()}`);
  };

  const addTeam = (teamSlug: string) =>
    currentTeams.length < 6 &&
    !currentTeams.includes(teamSlug) &&
    updateTeamsInUrl([...currentTeams, teamSlug]);
  const removeTeam = (teamSlug: string) =>
    updateTeamsInUrl(currentTeams.filter(slug => slug !== teamSlug));

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <TeamAutocomplete
          availableTeams={availableTeams}
          addTeam={addTeam}
          currentTeams={currentTeams}
          t={t}
          size="small"
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
        <TeamAutocomplete
          availableTeams={availableTeams}
          addTeam={addTeam}
          currentTeams={currentTeams}
          t={t}
        />

        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t('select-teams-to-compare')} ({currentTeams.length}/6)
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {currentTeamObjects.length > 0 ? (
              currentTeamObjects.map(team => (
                <Chip
                  key={team.slug}
                  label={`#${team.number} - ${team.name}`}
                  onDelete={() => removeTeam(team.slug)}
                  deleteIcon={<CloseIcon />}
                  color="primary"
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t('no-teams-selected')}
              </Typography>
            )}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};
