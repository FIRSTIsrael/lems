import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Typography, List, ListItemButton, ListItemText, TextField, Box } from '@mui/material';
import { Search } from '@mui/icons-material';
import { Team } from '@lems/types/api/admin';

interface TeamSelectorProps {
  teams: Team[];
  selectedTeamId: string | null;
  onTeamSelect: (teamId: string) => void;
}

export const TeamSelector: React.FC<TeamSelectorProps> = ({
  teams,
  selectedTeamId,
  onTeamSelect
}) => {
  const t = useTranslations('pages.events.schedule.team-swap');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return teams;

    const query = searchQuery.toLowerCase();
    return teams.filter(
      team =>
        team.number.toString().includes(query) ||
        team.name?.toLowerCase().includes(query) ||
        team.affiliation?.toLowerCase().includes(query)
    );
  }, [teams, searchQuery]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant="h6">{t('select-team')}</Typography>
      <Typography variant="body2" fontSize="small" color="text.secondary" gutterBottom>
        {t('description')}
      </Typography>

      <TextField
        placeholder={t('placeholder')}
        size="small"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        slotProps={{
          input: { startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }
        }}
        sx={{ mb: 2 }}
      />

      {filteredTeams.length === 0 ? (
        <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
          {searchQuery ? t('no-teams-found') : t('no-teams')}
        </Typography>
      ) : (
        <List sx={{ overflow: 'auto', flexGrow: 1 }}>
          {filteredTeams.map(team => (
            <ListItemButton
              key={team.id}
              selected={selectedTeamId === team.id}
              onClick={() => onTeamSelect(team.id)}
              sx={{
                borderRadius: 1,
                mb: 1,
                border: '1px solid',
                borderColor: selectedTeamId === team.id ? 'primary.main' : 'divider'
              }}
            >
              <ListItemText
                primary={t('team-label', { number: team.number })}
                secondary={team.name || team.affiliation}
              />
            </ListItemButton>
          ))}
        </List>
      )}
    </Box>
  );
};
