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
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(divisions[0] || null);

  const [availableTeams, setAvailableTeams] = useState<Team[]>(teams);
  const [registeredTeams, setRegisteredTeams] = useState<TeamWithDivision[]>([]);

  const handleAddTeam = (team: Team) => {
    if (!selectedDivision) return;

    const newRegisteredTeam: TeamWithDivision = {
      ...team,
      division: { ...selectedDivision }
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
                value={selectedDivision?.id || null}
                label={t('division')}
                onChange={e =>
                  setSelectedDivision(
                    divisions.find(division => division.id === e.target.value) || null
                  )
                }
              >
                {divisions.map(division => (
                  <MenuItem key={division.id} value={division.id}>
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
                  </ListItem>
                ))}
                {availableTeams.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary={t('no-available-teams')}
                      sx={{ textAlign: 'center', color: 'text.secondary' }}
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
                        #{registeredTeam.number} - {registeredTeam.division.name}
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
