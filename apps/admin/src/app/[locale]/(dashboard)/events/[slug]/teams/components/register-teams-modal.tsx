'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
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
  Grid
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

// Dummy data types
interface Division {
  id: string;
  name: string;
  color: string;
}

interface Team {
  id: string;
  number: number;
  name: string;
}

interface RegisteredTeam {
  team: Team;
  divisionId: string;
  divisionName: string;
  divisionColor: string;
}

interface RegisterTeamsModalProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
}

// Dummy data
const DUMMY_DIVISIONS: Division[] = [
  { id: '1', name: 'Division A', color: '#FF5722' },
  { id: '2', name: 'Division B', color: '#2196F3' },
  { id: '3', name: 'Division C', color: '#4CAF50' }
];

const DUMMY_TEAMS: Team[] = [
  { id: '1', number: 1234, name: 'Team Alpha' },
  { id: '2', number: 5678, name: 'Team Beta' },
  { id: '3', number: 9012, name: 'Team Gamma' },
  { id: '4', number: 3456, name: 'Team Delta' },
  { id: '5', number: 7890, name: 'Team Epsilon' },
  { id: '6', number: 2468, name: 'Team Zeta' },
  { id: '7', number: 1357, name: 'Team Eta' },
  { id: '8', number: 9753, name: 'Team Theta' }
];

export default function RegisterTeamsModal({ open, onClose, eventId }: RegisterTeamsModalProps) {
  const t = useTranslations('pages.events.teams.registration-dialog');

  const [selectedDivisionId, setSelectedDivisionId] = useState<string>(
    DUMMY_DIVISIONS[0]?.id || ''
  );
  const [registeredTeams, setRegisteredTeams] = useState<RegisteredTeam[]>([]);
  const [availableTeams, setAvailableTeams] = useState<Team[]>(DUMMY_TEAMS);

  const selectedDivision = DUMMY_DIVISIONS.find(d => d.id === selectedDivisionId);
  const hasMultipleDivisions = DUMMY_DIVISIONS.length > 1;

  const handleAddTeam = (team: Team) => {
    if (!selectedDivision) return;

    const newRegisteredTeam: RegisteredTeam = {
      team,
      divisionId: selectedDivision.id,
      divisionName: selectedDivision.name,
      divisionColor: selectedDivision.color
    };

    setRegisteredTeams(prev => [...prev, newRegisteredTeam]);
    setAvailableTeams(prev => prev.filter(t => t.id !== team.id));
  };

  const handleRemoveTeam = (teamId: string) => {
    const removedTeam = registeredTeams.find(rt => rt.team.id === teamId);
    if (!removedTeam) return;

    setRegisteredTeams(prev => prev.filter(rt => rt.team.id !== teamId));
    setAvailableTeams(prev => [...prev, removedTeam.team].sort((a, b) => a.number - b.number));
  };

  const handleSubmit = () => {
    console.log('Registering teams:', {
      eventId,
      registrations: registeredTeams.map(rt => ({
        teamId: rt.team.id,
        teamNumber: rt.team.number,
        teamName: rt.team.name,
        divisionId: rt.divisionId,
        divisionName: rt.divisionName
      }))
    });
    onClose();
  };

  const handleClose = () => {
    // Reset state when closing
    setRegisteredTeams([]);
    setAvailableTeams(DUMMY_TEAMS);
    setSelectedDivisionId(DUMMY_DIVISIONS[0]?.id || '');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { height: '80vh', maxHeight: '800px' } } }}
    >
      <DialogTitle>{t('title')}</DialogTitle>

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
                {DUMMY_DIVISIONS.map(division => (
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
                    key={registeredTeam.team.id}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: registeredTeam.divisionColor
                          }}
                        />
                        #{registeredTeam.team.number} - {registeredTeam.divisionName}
                      </Box>
                    }
                    onDelete={() => handleRemoveTeam(registeredTeam.team.id)}
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
        </Grid>
      </DialogContent>

      <DialogActions sx={{ my: 1 }}>
        <Button onClick={handleClose}>{t('actions.cancel')}</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={registeredTeams.length === 0}>
          {t('actions.register', { count: registeredTeams.length })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
