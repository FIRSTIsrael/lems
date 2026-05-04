'use client';

import { useMemo } from 'react';
import {
  TextField,
  List,
  ListItemButton,
  ListItemText,
  Chip,
  Stack,
  CircularProgress,
  Box,
  InputAdornment,
  Typography,
  Avatar,
  ListItemIcon
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslations } from 'next-intl';
import { Team as AdminTeam, TeamWithDivision } from '@lems/types/api/admin';
import { Flag } from '@lems/shared';

interface TeamSelectionStepProps {
  teams: AdminTeam[];
  teamsLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTeam: TeamWithDivision;
  onTeamSelect: (team: AdminTeam) => void;
}

export const TeamSelectionStep = ({
  teams,
  teamsLoading,
  searchQuery,
  onSearchChange,
  selectedTeam,
  onTeamSelect
}: TeamSelectionStepProps) => {
  const t = useTranslations('pages.events.teams.edit-teams-dialog');

  const otherTeams = useMemo(() => {
    return teams.filter(team => team.id !== selectedTeam.id);
  }, [teams, selectedTeam.id]);

  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return otherTeams;

    const query = searchQuery.toLowerCase();
    return otherTeams.filter(
      team =>
        team.number.toString().includes(query) ||
        team.name.toLowerCase().includes(query) ||
        team.affiliation.toLowerCase().includes(query)
    );
  }, [otherTeams, searchQuery]);

  return (
    <Stack spacing={2}>
      {selectedTeam && (
        <Box sx={{ p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('first-team-selected')}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Chip
              label={`#${selectedTeam.number} - ${selectedTeam.name}`}
              color="primary"
              variant="outlined"
            />
          </Stack>
        </Box>
      )}

      <TextField
        autoFocus
        placeholder={t('search-placeholder')}
        value={searchQuery}
        onChange={e => onSearchChange(e.target.value)}
        fullWidth
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          )
        }}
      />

      {teamsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={40} />
        </Box>
      ) : filteredTeams.length === 0 ? (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('no-teams')}</Typography>
        </Box>
      ) : (
        <List disablePadding sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
          {filteredTeams.map((team, index) => {
            return (
              <ListItemButton
                key={team.id}
                onClick={() => onTeamSelect(team)}
                divider={index < filteredTeams.length - 1}
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  },
                  alignItems: 'flex-start'
                }}
              >
                <ListItemIcon sx={{ minWidth: 48, mt: 0.5 }}>
                  <Avatar
                    src={team.logoUrl || undefined}
                    alt={team.name}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: 'primary.main'
                    }}
                  >
                    {team.number}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: 'center', mb: 0.5, flexWrap: 'wrap' }}
                    >
                      <span>{`#${team.number} - ${team.name}`}</span>
                      <Flag region={team.region} size={20} />
                      <Chip
                        label="Competing in this event"
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Stack>
                  }
                  secondary={
                    <Stack spacing={0.25}>
                      <span>{team.city}</span>
                      <span>{team.affiliation}</span>
                    </Stack>
                  }
                />
              </ListItemButton>
            );
          })}
        </List>
      )}
    </Stack>
  );
};
