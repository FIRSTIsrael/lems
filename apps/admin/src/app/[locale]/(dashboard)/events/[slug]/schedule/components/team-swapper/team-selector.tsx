import React from 'react';
import { useTranslations } from 'next-intl';
import { Typography, List, ListItemButton, ListItemText } from '@mui/material';
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
  const t = useTranslations('pages.events.schedule.teamSwap');

  return (
    <>
      <Typography variant="h6" gutterBottom>
        {t('selectTeam')}
      </Typography>

      {teams.length === 0 ? (
        <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
          {t('noTeams')}
        </Typography>
      ) : (
        <List>
          {teams.map(team => (
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
                primary={t('teamLabel', { number: team.number })}
                secondary={team.name || team.affiliation}
              />
            </ListItemButton>
          ))}
        </List>
      )}
    </>
  );
};
