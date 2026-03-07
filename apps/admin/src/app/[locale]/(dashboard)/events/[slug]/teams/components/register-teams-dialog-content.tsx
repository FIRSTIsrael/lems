'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Grid,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Team, Division, TeamWithDivision } from '@lems/types/api/admin';
import { Flag } from '@lems/shared';

interface RegisterTeamsDialogContentProps {
  teams: Team[];
  divisions: Division[];
  onClose: () => void;
  handleSubmit: (teams: TeamWithDivision[]) => void;
}

export const RegisterTeamsDialogContent: React.FC<RegisterTeamsDialogContentProps> = ({
  teams,
  divisions,
  onClose,
  handleSubmit
}) => {
  const t = useTranslations('pages.events.teams.registration-dialog');

  const hasMultipleDivisions = divisions.length > 1;

  const availableDivisions = divisions.filter(division => !division.hasSchedule);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('random');
  const [availableTeams, setAvailableTeams] = useState<Team[]>(teams);
  const [registeredTeams, setRegisteredTeams] = useState<TeamWithDivision[]>([]);
  const [nextDivisionIndex, setNextDivisionIndex] = useState(0);

  const selectedDivision =
    selectedDivisionId === 'random'
      ? null
      : divisions.find(division => division.id === selectedDivisionId) || null;

  const handleAddTeam = (team: Team) => {
    let division: Division;

    if (selectedDivisionId === 'random') {
      if (availableDivisions.length === 0) return;
      division = availableDivisions[nextDivisionIndex % availableDivisions.length];
      setNextDivisionIndex(prev => prev + 1);
    } else {
      if (!selectedDivision) return;
      division = selectedDivision;
    }

    const newRegisteredTeam: TeamWithDivision = {
      ...team,
      division: { ...division }
    };

    setRegisteredTeams(prev => [...prev, newRegisteredTeam]);
    setAvailableTeams(prev => prev.filter(t => t.id !== team.id));
  };

  const handleRemoveTeam = (teamId: string) => {
    const removedTeam = registeredTeams.find(rt => rt.id === teamId);
    if (!removedTeam) return;

    setRegisteredTeams(prev => prev.filter(rt => rt.id !== teamId));
    setAvailableTeams(prev => [...prev, removedTeam].sort((a, b) => a.number - b.number));
  };

  return (
    <>
      <DialogContent
        dividers
        sx={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        <Box sx={{ mb: 2 }}>
          {hasMultipleDivisions && (
            <FormControl fullWidth>
              <InputLabel>{t('division')}</InputLabel>
              <Select
                value={selectedDivisionId}
                label={t('division')}
                onChange={e => setSelectedDivisionId(e.target.value)}
              >
                <MenuItem value="random" key="random">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{t('random')}</Box>
                </MenuItem>
                {divisions.map(division => (
                  <MenuItem key={division.id} value={division.id} disabled={division.hasSchedule}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: division.color
                        }}
                      />
                      {division.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
        <Grid container spacing={2} sx={{ flex: 1, minHeight: 0 }}>
          {/* Available Teams List */}
          <Grid size={6} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              {t('available-teams')}
            </Typography>
            <Box
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                flex: 1,
                height: '100%',
                overflow: 'auto'
              }}
            >
              <List dense>
                {availableTeams.map(team => (
                  <ListItem
                    key={team.id}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => handleAddTeam(team)} color="primary">
                        <AddIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText primary={`#${team.number}`} secondary={team.name} />
                    <Flag region={team.region} size={16} />
                  </ListItem>
                ))}
                {availableTeams.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary={t('no-available-teams')}
                      sx={{ textAlign: 'center', color: 'text.secondary', mt: 2 }}
                    />
                  </ListItem>
                )}
              </List>
            </Box>
          </Grid>

          {/* Registered Teams Chips */}
          <Grid size={6} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              {t('registered-teams', { count: registeredTeams.length })}
            </Typography>
            <Box
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                flex: 1,
                height: '100%',
                overflow: 'auto',
                p: 2
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {registeredTeams.map(registeredTeam => (
                  <Chip
                    key={registeredTeam.id}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: registeredTeam.division.color
                          }}
                        />
                        {`#${registeredTeam.number}`}
                        <Flag region={registeredTeam.region} size={16} />
                        {divisions.length > 1 && ` - ${registeredTeam.division.name}`}
                      </Box>
                    }
                    onDelete={() => handleRemoveTeam(registeredTeam.id)}
                    sx={{ alignSelf: 'flex-start' }}
                  />
                ))}
                {registeredTeams.length === 0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: 'center', mt: 2 }}
                  >
                    {t('no-teams-selected')}
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>{' '}
      </DialogContent>

      <DialogActions sx={{ my: 1 }}>
        <Button onClick={onClose}>{t('actions.cancel')}</Button>
        <Button
          onClick={() => handleSubmit(registeredTeams)}
          variant="contained"
          disabled={registeredTeams.length === 0}
        >
          {t('actions.register', { count: registeredTeams.length })}
        </Button>
      </DialogActions>
    </>
  );
};
