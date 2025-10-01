'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Box, Paper, Stack, CircularProgress, Avatar, Divider } from '@mui/material';
import { SwapHoriz } from '@mui/icons-material';
import { apiFetch } from '@lems/shared';
import { Division, Team } from '@lems/types/api/admin';
import {
  AdminTeamScheduleResponseSchema,
  AdminJudgingSessionsWithRoomsResponseSchema,
  TeamSchedule,
  JudgingSessionsWithRooms
} from '@lems/types/api/admin/schedule';
import { useEvent } from '../../../components/event-context';
import { RoomWithTeam } from './types';
import { groupSessionsByTime } from './utils';
import { TeamSelector } from './team-selector';
import { TeamScheduleView } from './team-schedule-view';
import { JudgingSessionSelector } from './judging-session-selector';
import { SwapConfirmDialog } from './swap-confirm-dialog';

interface TeamSwapperProps {
  division: Division;
}

export const TeamSwapper: React.FC<TeamSwapperProps> = ({ division }) => {
  const event = useEvent();
  const searchParams = useSearchParams();
  const selectedDivisionId = searchParams.get('division') || division.id;

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomWithTeam | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  const {
    data: teams = [],
    isLoading: teamsLoading,
    mutate: mutateTeams
  } = useSWR<Team[]>(`/admin/events/${event.id}/divisions/${selectedDivisionId}/teams`);

  const {
    data: teamSchedule,
    isLoading: scheduleLoading,
    mutate: mutateTeamSchedule
  } = useSWR<TeamSchedule>(
    selectedTeamId
      ? [
          `/admin/events/${event.id}/divisions/${selectedDivisionId}/schedule/teams/${selectedTeamId}`,
          AdminTeamScheduleResponseSchema
        ]
      : null
  );

  const {
    data: judgingData,
    isLoading: sessionsLoading,
    mutate: mutateJudgingSessions
  } = useSWR<JudgingSessionsWithRooms>(
    selectedTeamId
      ? [
          `/admin/events/${event.id}/divisions/${selectedDivisionId}/schedule/judging-sessions`,
          AdminJudgingSessionsWithRoomsResponseSchema
        ]
      : null
  );

  const judgingSessionTimes = useMemo(() => {
    if (!judgingData) return [];
    return groupSessionsByTime(judgingData.sessions, judgingData.rooms);
  }, [judgingData]);

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeamId(teamId);
    setSelectedRoom(null);
  };

  const handleRoomSelect = (room: RoomWithTeam) => {
    setSelectedRoom(room);
    setConfirmDialogOpen(true);
  };

  const handleSwapConfirm = async () => {
    if (!selectedRoom || !teamSchedule?.team) {
      return;
    }

    setIsSwapping(true);
    try {
      const response = await apiFetch(
        `/admin/events/${event.id}/divisions/${selectedDivisionId}/schedule/swap`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teamId1: teamSchedule.team.id,
            teamId2: selectedRoom.teamId
          })
        }
      );

      if (response.ok) {
        // Refresh all relevant data from the team swapper
        await Promise.all([mutateTeams(), mutateTeamSchedule(), mutateJudgingSessions()]);
        setConfirmDialogOpen(false);
        setSelectedRoom(null);
      } else {
        console.error('Failed to swap teams');
      }
    } catch (error) {
      console.error('Error swapping teams:', error);
    } finally {
      setIsSwapping(false);
    }
  };

  if (teamsLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Stack height="100vh" spacing={2} sx={{ overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', gap: 2, flex: 1, minHeight: 0 }}>
          <Paper
            sx={{ m: 1, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          >
            <Box p={3} flex={1} display="flex" flexDirection="column" overflow="hidden">
              <Box
                sx={{
                  flex: selectedTeamId ? '0 0 40%' : '1',
                  overflow: 'hidden',
                  mb: selectedTeamId ? 2 : 0
                }}
              >
                <TeamSelector
                  teams={teams}
                  selectedTeamId={selectedTeamId}
                  onTeamSelect={handleTeamSelect}
                />
              </Box>

              {selectedTeamId && (
                <Box sx={{ flex: '1', overflow: 'auto' }}>
                  <TeamScheduleView teamSchedule={teamSchedule} isLoading={scheduleLoading} />
                </Box>
              )}
            </Box>
          </Paper>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              width: 40,
              flexShrink: 0
            }}
          >
            <Divider orientation="vertical" sx={{ height: '100%' }} />
            <Avatar
              sx={{
                position: 'absolute',
                bgcolor: 'background.paper',
                border: '2px solid',
                borderColor: 'divider',
                width: 48,
                height: 48
              }}
            >
              <SwapHoriz color="primary" />
            </Avatar>
          </Box>

          <Paper sx={{ m: 1, flex: 1, p: 3, overflow: 'auto' }}>
            <JudgingSessionSelector
              selectedTeamId={selectedTeamId}
              judgingSessionTimes={judgingSessionTimes}
              teams={teams}
              isLoading={sessionsLoading}
              onRoomSelect={handleRoomSelect}
            />
          </Paper>
        </Box>
      </Stack>

      <SwapConfirmDialog
        open={confirmDialogOpen}
        isSwapping={isSwapping}
        selectedRoom={selectedRoom}
        teamSchedule={teamSchedule}
        judgingSessionTimes={judgingSessionTimes}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleSwapConfirm}
      />
    </>
  );
};
