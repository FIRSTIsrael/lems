'use client';

import { useState, useCallback } from 'react';
import {
  Stack,
  Box,
  Typography,
  Button,
  Autocomplete,
  TextField,
  Chip,
  alpha,
  useTheme
} from '@mui/material';
import { PlayArrow, Lock } from '@mui/icons-material';
import { useCategoryDeliberation } from '../deliberation-context';

export function ControlsPanel() {
  const theme = useTheme();
  const { deliberation, teams, startDeliberation, availableTeams } = useCategoryDeliberation();
  const [selectedTeam1, setSelectedTeam1] = useState<string | null>(null);
  const [selectedTeam2, setSelectedTeam2] = useState<string | null>(null);

  const handleStartDeliberation = useCallback(async () => {
    await startDeliberation();
  }, [startDeliberation]);

  const isInProgress = deliberation?.status === 'in-progress';

  const teamOptions = teams.map(t => ({
    label: `${t.number} - ${t.name}`,
    value: t.id
  }));

  return (
    <Stack
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        gap: 2
      }}
    >
      {/* Status Card */}
      <Box
        sx={{
          p: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: 'white',
          borderRadius: 1
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Status
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {deliberation?.status === 'in-progress' ? 'In Progress' : 'Not Started'}
        </Typography>

        {!isInProgress ? (
          <Button
            variant="contained"
            fullWidth
            startIcon={<PlayArrow />}
            onClick={handleStartDeliberation}
            sx={{
              bgcolor: '#fff',
              color: theme.palette.primary.main,
              '&:hover': {
                bgcolor: alpha('#fff', 0.9)
              },
              fontWeight: 600
            }}
          >
            Start Deliberation
          </Button>
        ) : (
          <Button
            variant="contained"
            fullWidth
            startIcon={<Lock />}
            disabled
            sx={{
              bgcolor: alpha('white', 0.3),
              color: 'white',
              fontWeight: 600
            }}
          >
            Deliberation Active
          </Button>
        )}
      </Box>

      {/* Comparison Card */}
      <Box
        sx={{
          p: 2,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Compare Teams
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Autocomplete
            options={teamOptions}
            value={teamOptions.find(o => o.value === selectedTeam1) || null}
            onChange={(_, value) => setSelectedTeam1(value?.value || null)}
            renderInput={params => <TextField {...params} label="Team 1" size="small" />}
            size="small"
            fullWidth
            sx={{ flex: 1 }}
          />
          <Autocomplete
            options={teamOptions}
            value={teamOptions.find(o => o.value === selectedTeam2) || null}
            onChange={(_, value) => setSelectedTeam2(value?.value || null)}
            renderInput={params => <TextField {...params} label="Team 2" size="small" />}
            size="small"
            fullWidth
            sx={{ flex: 1 }}
          />
        </Box>

        <Button variant="outlined" fullWidth disabled sx={{ mt: 'auto' }}>
          Compare
        </Button>
        <Typography variant="caption" color="textSecondary">
          Coming Soon
        </Typography>
      </Box>

      {/* Available Teams Pool */}
      <Box
        sx={{
          p: 2,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          minHeight: 0
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Available Teams
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
            overflowY: 'auto',
            flex: 1,
            minHeight: 0
          }}
        >
          {availableTeams.length === 0 ? (
            <Typography variant="caption" color="textSecondary" sx={{ py: 2, textAlign: 'center' }}>
              No available teams
            </Typography>
          ) : (
            availableTeams.map(teamId => {
              const team = teams.find(t => t.id === teamId);
              if (!team) return null;

              return (
                <Chip
                  key={team.id}
                  label={`${team.number} - ${(team.normalizedScores.total || 0).toFixed(2)}`}
                  variant="outlined"
                  size="small"
                  sx={{ justifyContent: 'flex-start' }}
                />
              );
            })
          )}
        </Box>
      </Box>
    </Stack>
  );
}
