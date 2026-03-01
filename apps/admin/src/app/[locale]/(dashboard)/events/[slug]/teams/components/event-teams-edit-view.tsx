'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
  Tabs,
  Tab,
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Chip,
  CircularProgress
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { Division, TeamWithDivision } from '@lems/types/api/admin';
import { useEvent } from '../../components/event-context';
import { EditTeamsDialog } from './edit-teams-dialog';

interface EventTeamsEditViewProps {
  eventId: string;
  divisions: Division[];
}

export const EventTeamsEditView = ({ eventId, divisions }: EventTeamsEditViewProps) => {
  const t = useTranslations('pages.events.teams');
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState<TeamWithDivision | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const event = useEvent();

  const { data: teams = [], isLoading: teamsLoading } = useSWR<TeamWithDivision[]>(
    `/admin/events/${event.id}/teams`
  );

  const currentDivision = divisions[selectedTabIndex];
  const divisionsTeams = teams.filter(team => team.division.id === currentDivision?.id);

  const handleTeamSelect = (team: TeamWithDivision) => {
    setSelectedTeam(team);
    setEditDialogOpen(true);
  };

  const handleDialogClose = () => {
    setEditDialogOpen(false);
    setSelectedTeam(null);
  };

  if (divisions.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="text.secondary">{t('no-teams')}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 3 }}>
      <Tabs
        value={selectedTabIndex}
        onChange={(_, newValue) => setSelectedTabIndex(newValue)}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        {divisions.map(division => (
          <Tab
            key={division.id}
            label={division.name}
            icon={
              <Chip
                label={division.name}
                size="small"
                sx={{
                  backgroundColor: division.color,
                  color: '#fff',
                  ml: 1
                }}
              />
            }
          />
        ))}
      </Tabs>

      {currentDivision && (
        <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <CardContent sx={{ flex: 1, overflow: 'auto' }}>
            {teamsLoading ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%'
                }}
              >
                <CircularProgress />
              </Box>
            ) : divisionsTeams.length === 0 ? (
              <Typography color="text.secondary">{t('no-teams')}</Typography>
            ) : (
              <List disablePadding>
                {divisionsTeams.map(team => (
                  <ListItemButton
                    key={team.id}
                    onClick={() => handleTeamSelect(team)}
                    sx={{
                      mb: 1,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <ListItemText
                      primary={`#${team.number} - ${team.name}`}
                      secondary={team.affiliation}
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}

      {selectedTeam && (
        <EditTeamsDialog
          open={editDialogOpen}
          onClose={handleDialogClose}
          selectedTeam={selectedTeam}
          eventId={eventId}
          divisions={[]}
        />
      )}
    </Box>
  );
};
