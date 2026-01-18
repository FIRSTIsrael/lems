'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Box,
  Paper,
  Typography,
  Select,
  MenuItem,
  Stack,
  useTheme,
  FormControl,
  InputLabel
} from '@mui/material';
import { useFinalDeliberation } from '../../final-deliberation-context';

export function ChampionsPodium() {
  const theme = useTheme();
  const t = useTranslations('pages.deliberations.final.champions');
  const { awards, awardCounts, availableTeams, deliberation, teams, updateAward } =
    useFinalDeliberation();
  const [isSaving, setIsSaving] = useState(false);

  // Create team lookup for display
  const teamLookup = useMemo(() => new Map(teams.map(team => [team.id, team])), [teams]);

  const places = useMemo(
    () => Array.from({ length: awardCounts.champions ?? 4 }, (_, i) => i + 1),
    [awardCounts.champions]
  );

  const handleTeamSelect = useCallback(
    async (place: number, teamId: string) => {
      setIsSaving(true);
      try {
        const updatedChampions = { ...awards.champions, [place]: teamId };
        await updateAward('champions', updatedChampions);
      } finally {
        setIsSaving(false);
      }
    },
    [awards.champions, updateAward]
  );

  const podiumHeights = [140, 100, 80, 60]; // Heights for 1st, 2nd, 3rd, 4th places

  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 1.5,
        boxShadow: theme.shadows[1],
        height: '60%',
        flexDirection: 'column',
        gap: 2.5
      }}
    >
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
          {t('podium-title')}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }} gutterBottom>
          {t('description')}
        </Typography>
      </Box>

      {/* Podium Visualization */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: 1,
          height: 200,
          px: 1,
          py: 2,
          backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#fafafa',
          borderRadius: 1
        }}
      >
        {places.map(place => {
          const selectedTeamId = awards.champions[place];
          const selectedTeam = selectedTeamId ? teamLookup.get(selectedTeamId) : null;
          const height = podiumHeights[place - 1];
          return (
            <Box
              key={place}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                flex: '0 0 auto',
                minWidth: 100
              }}
            >
              {/* Podium Block */}
              <Paper
                sx={{
                  width: '100%',
                  height: height,
                  backgroundColor: [
                    theme.palette.primary.main, // 1st
                    '#b0bec5', // 2nd
                    '#90a4ae', // 3rd
                    '#78909c' // 4th
                  ][place - 1],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1.5rem',
                  elevation: 2,
                  boxShadow: theme.shadows[2]
                }}
              >
                {place}
              </Paper>

              {/* Team Display */}
              {selectedTeam && (
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    textAlign: 'center',
                    maxWidth: 100,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {selectedTeam.number}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Team Selection Dropdowns */}
      <Stack spacing={1.5} pt={2}>
        {places.map(place => (
          <FormControl key={place} fullWidth size="small">
            <InputLabel id={`place-${place}-label`}>{t('place-label', { place })}</InputLabel>
            <Select
              labelId={`place-${place}-label`}
              id={`place-${place}`}
              value={awards.champions[place] || ''}
              label={t('place-label', { place })}
              onChange={e => handleTeamSelect(place, e.target.value)}
              disabled={isSaving || deliberation.status !== 'in-progress'}
              sx={{ borderRadius: 1 }}
            >
              <MenuItem value="">
                <em>{t('select-team')}</em>
              </MenuItem>
              {availableTeams.map(teamId => {
                const team = teamLookup.get(teamId);
                return (
                  <MenuItem key={teamId} value={teamId}>
                    {team?.number} - {team?.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        ))}
      </Stack>
    </Paper>
  );
}
