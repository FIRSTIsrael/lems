'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { useGraphQLSubscription, useGraphQLMutation } from '../../../../../lib/graphql';
import { ConnectionStatusIndicator } from '../../../../../lib/graphql/connection-status-indicator';
import { useEvent } from '../components/event-context';
import {
  TEAM_ARRIVAL_QUERY,
  TEAM_ARRIVAL_SUBSCRIPTION,
  UPDATE_TEAM_ARRIVAL_MUTATION
} from './graphql';
import { DivisionSchema, TeamArrivalUpdateSchema, type Team, type DivisionData } from './types';

export default function PitAdminPage() {
  const { eventId, currentDivision } = useEvent();
  const [teamNumberInput, setTeamNumberInput] = useState('');

  // Subscribe to team arrival updates with real-time synchronization
  const { data, error, isLoading, revalidate } = useGraphQLSubscription<DivisionData>({
    subscription: TEAM_ARRIVAL_SUBSCRIPTION,
    initialQuery: TEAM_ARRIVAL_QUERY,
    initialQueryVariables: { divisionId: currentDivision.id },
    schema: DivisionSchema,
    onUpdate: (currentData, update) => {
      if (!currentData) {
        return {
          division: {
            teams: []
          }
        };
      }

      // Defensive check - update might be undefined during initial subscription setup
      if (!update) {
        console.warn('Received undefined update, keeping current data');
        return currentData;
      }

      try {
        const validatedUpdate = TeamArrivalUpdateSchema.parse(update);
        const { teamId, arrived } = validatedUpdate.teamArrivalUpdated;

        // Update the team in the list
        return {
          division: {
            teams: currentData.division.teams.map((team: Team) =>
              team.id === teamId ? { ...team, arrived } : team
            )
          }
        };
      } catch (err) {
        console.error('Failed to parse team arrival update:', err);
        console.error('Received update:', update);
        // Return current data on parse error to avoid breaking the app
        return currentData;
      }
    }
  });

  // Mutation to update team arrival
  const { mutate: updateTeamArrival, isLoading: isUpdating } = useGraphQLMutation({
    mutation: UPDATE_TEAM_ARRIVAL_MUTATION,
    onSuccess: () => {
      setTeamNumberInput('');
    },
    onError: (err: Error) => {
      console.error('Failed to update team arrival:', err);
    }
  });

  const teams = data?.division.teams || [];

  const handleMarkArrived = async (teamId: string) => {
    await updateTeamArrival({ teamId, arrived: true, divisionId: currentDivision.id });
  };

  const handleMarkNotArrived = async (teamId: string) => {
    await updateTeamArrival({ teamId, arrived: false, divisionId: currentDivision.id });
  };

  const handleQuickArrival = () => {
    const team = teams.find((t: Team) => t.number === teamNumberInput);
    if (team) {
      handleMarkArrived(team.id);
    }
  };

  const arrivedCount = teams.filter((t: Team) => t.arrived).length;
  const totalCount = teams.length;

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" action={<Button onClick={revalidate}>Retry</Button>}>
          Failed to load team data: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Stack spacing={3}>
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" gutterBottom>
                Pit Admin - Team Arrival
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Event: {eventId} • Division: {currentDivision.name}
              </Typography>
            </Box>
            <ConnectionStatusIndicator />
          </Stack>
        </Box>

        {/* Arrival Summary */}
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="h6">Arrival Status:</Typography>
              <Chip
                label={`${arrivedCount} / ${totalCount} Teams Arrived`}
                color={arrivedCount === totalCount ? 'success' : 'default'}
                size="medium"
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Quick Arrival Input */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Team Check-in
            </Typography>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Team Number"
                value={teamNumberInput}
                onChange={e => setTeamNumberInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleQuickArrival()}
                size="small"
                disabled={isUpdating || isLoading}
                fullWidth
              />
              <Button
                variant="contained"
                onClick={handleQuickArrival}
                disabled={!teamNumberInput || isUpdating || isLoading}
              >
                Mark Arrived
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Team List */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              All Teams
            </Typography>

            {isLoading && teams.length === 0 ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {teams
                  .sort((a: Team, b: Team) => parseInt(a.number) - parseInt(b.number))
                  .map((team: Team) => (
                    <ListItem
                      key={team.id}
                      secondaryAction={
                        <Stack direction="row" spacing={1}>
                          {!team.arrived ? (
                            <Button
                              variant="outlined"
                              color="success"
                              size="small"
                              onClick={() => handleMarkArrived(team.id)}
                              disabled={isUpdating}
                              startIcon={<CheckCircleIcon />}
                            >
                              Mark Arrived
                            </Button>
                          ) : (
                            <Button
                              variant="outlined"
                              color="warning"
                              size="small"
                              onClick={() => handleMarkNotArrived(team.id)}
                              disabled={isUpdating}
                              startIcon={<RadioButtonUncheckedIcon />}
                            >
                              Mark Not Arrived
                            </Button>
                          )}
                        </Stack>
                      }
                      sx={{
                        bgcolor: team.arrived ? 'success.light' : 'transparent',
                        borderRadius: 1,
                        mb: 1,
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: team.arrived ? 'success.light' : 'action.hover'
                        }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Stack direction="row" spacing={2} alignItems="center">
                            <IconButton size="small" disabled>
                              {team.arrived ? (
                                <CheckCircleIcon color="success" />
                              ) : (
                                <RadioButtonUncheckedIcon color="disabled" />
                              )}
                            </IconButton>
                            <Typography variant="subtitle1" fontWeight="bold">
                              #{team.number}
                            </Typography>
                            <Typography variant="body1">{team.name}</Typography>
                          </Stack>
                        }
                      />
                    </ListItem>
                  ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
