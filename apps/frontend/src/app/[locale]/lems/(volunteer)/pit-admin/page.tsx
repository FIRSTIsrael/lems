'use client';

import { useState } from 'react';
import {
  Box,
  Stack,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Autocomplete,
  TextField,
  Button
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import { useEvent } from '../components/event-context';
import { usePitAdminTeams } from './use-pit-admin-teams';
import type { Team } from './graphql';

export default function PitAdminPage() {
  const { currentDivision } = useEvent();
  const { teams, loading, error, connected, markTeamArrived } = usePitAdminTeams(
    currentDivision.id
  );

  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleMarkArrived = async () => {
    if (!selectedTeam) return;

    setSubmitting(true);
    try {
      await markTeamArrived(selectedTeam.id);
      setSelectedTeam(null); // Clear selection after success
    } finally {
      setSubmitting(false);
    }
  };

  // Filter out teams that have already arrived for the autocomplete
  const unarrivedTeams = teams.filter(team => !team.arrived);

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header with connection status */}
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h5" component="h1">
              Pit Admin - {currentDivision.name}
            </Typography>
            <Chip
              icon={connected ? <CloudDoneIcon /> : <CloudOffIcon />}
              label={connected ? 'Connected' : 'Disconnected'}
              color={connected ? 'success' : 'error'}
              size="small"
            />
          </Stack>
        </Paper>

        {/* Error display */}
        {error && <Alert severity="error">Error loading teams: {error.message}</Alert>}

        {/* Loading state */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Team arrival input */}
        {!loading && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Mark Team Arrival
            </Typography>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Autocomplete
                sx={{ flex: 1 }}
                options={unarrivedTeams}
                getOptionLabel={team => `${team.number} - ${team.name}`}
                value={selectedTeam}
                onChange={(_event, newValue) => setSelectedTeam(newValue)}
                renderInput={params => (
                  <TextField
                    {...params}
                    label="Select Team"
                    placeholder="Search by number or name..."
                  />
                )}
                renderOption={(props, team) => (
                  <li {...props} key={team.id}>
                    <Stack>
                      <Typography variant="body1">
                        Team {team.number} - {team.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {team.affiliation} • {team.city}
                      </Typography>
                    </Stack>
                  </li>
                )}
                disabled={submitting}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleMarkArrived}
                disabled={!selectedTeam || submitting}
                sx={{ minWidth: 120, height: 56 }}
              >
                {submitting ? <CircularProgress size={24} /> : 'Mark Arrived'}
              </Button>
            </Stack>
          </Paper>
        )}

        {/* Teams list */}
        {!loading && teams.length > 0 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              All Teams ({teams.length})
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {teams.filter(t => t.arrived).length} arrived • {unarrivedTeams.length} pending
            </Typography>
            <List>
              {teams.map(team => (
                <ListItem
                  key={team.id}
                  sx={{
                    borderLeft: 4,
                    borderColor: team.arrived ? 'success.main' : 'warning.main',
                    mb: 1,
                    borderRadius: 1,
                    bgcolor: team.arrived ? 'success.50' : 'background.paper'
                  }}
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          Team {team.number}
                        </Typography>
                        <Typography variant="body1">{team.name}</Typography>
                        {team.arrived ? (
                          <CheckCircleIcon color="success" fontSize="small" />
                        ) : (
                          <PendingIcon color="warning" fontSize="small" />
                        )}
                      </Stack>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {team.affiliation} • {team.city}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {/* Empty state */}
        {!loading && teams.length === 0 && !error && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No teams found for this division
            </Typography>
          </Paper>
        )}
      </Stack>
    </Box>
  );
}
