'use client';

import {
  Autocomplete,
  Box,
  CircularProgress,
  TextField,
  Stack,
  Typography,
  useTheme,
  alpha
} from '@mui/material';
import { useTranslations } from 'next-intl';
import SearchIcon from '@mui/icons-material/Search';
import type { Team } from '../../graphql/types';

interface SearchTeamSectionProps {
  availableTeams: Team[];
  selectedTeam: Team | null;
  onTeamSelect: (team: Team | null) => void;
  loading: boolean;
}

export function SearchTeamSection({
  availableTeams,
  selectedTeam,
  onTeamSelect,
  loading
}: SearchTeamSectionProps) {
  const t = useTranslations('pages.judge-advisor.awards.disqualification');
  const theme = useTheme();

  return (
    <Stack spacing={3}>
      <Autocomplete
        options={availableTeams}
        getOptionLabel={team =>
          t('team-option-label', {
            number: team.number,
            name: team.name,
            affiliation: team.affiliation,
            city: team.city
          })
        }
        value={selectedTeam}
        onChange={(_, newValue) => onTeamSelect(newValue)}
        disabled={loading || availableTeams.length === 0}
        noOptionsText={t('no-teams-found')}
        renderInput={params => (
          <TextField
            {...params}
            label={t('search-label')}
            placeholder={t('search-placeholder')}
            size="small"
            slotProps={{
              input: {
                ...params.InputProps,
                startAdornment: (
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                    <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </Box>
                ),
                endAdornment: (
                  <>
                    {loading && <CircularProgress color="inherit" size={20} />}
                    {params.InputProps.endAdornment}
                  </>
                )
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                transition: theme.transitions.create(['box-shadow', 'border-color']),
                '&:hover': {
                  boxShadow: theme.shadows[2]
                }
              }
            }}
          />
        )}
        renderOption={(props, team) => (
          <Box component="li" {...props} key={team.id}>
            <Stack spacing={0.5} width="100%">
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  #{team.number}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {team.name}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  {team.affiliation} • {team.city}
                </Typography>
              </Stack>
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
    </Stack>
  );
}
