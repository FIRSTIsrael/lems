'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Box, Paper, Stack, Alert, CircularProgress, Avatar, Divider } from '@mui/material';
import { SwapHoriz, Schedule } from '@mui/icons-material';
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
  const t = useTranslations('pages.events.schedule.teamSwap');
  const event = useEvent();
  const searchParams = useSearchParams();
  const selectedDivisionId = searchParams.get('division') || division.id;

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomWithTeam | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  // Fetch teams in division
  const {
    data: teams = [],
    isLoading: teamsLoading,
    mutate: mutateTeams
  } = useSWR<Team[]>(`/admin/events/${event.id}/divisions/${selectedDivisionId}/teams`);

  // Fetch selected team's schedule
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

  // Fetch judging sessions and rooms
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

  // Transform the judging data using our utility function
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
      <Stack height="100%" spacing={2}>
        <Alert severity="info" icon={<Schedule />} sx={{ py: 0.5 }}>
          {t('description')}
        </Alert>

        <Box sx={{ display: 'flex', gap: 2, height: 'calc(100% - 64px)' }}>
          {/* Left side - Team selection and schedule */}
          <Paper sx={{ flex: 1, p: 3, overflow: 'auto' }}>
            <TeamSelector
              teams={teams}
              selectedTeamId={selectedTeamId}
              onTeamSelect={handleTeamSelect}
            />

            {selectedTeamId && (
              <TeamScheduleView teamSchedule={teamSchedule} isLoading={scheduleLoading} />
            )}
          </Paper>

          {/* Center divider with swap icon */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              width: 40
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

          {/* Right side - Judging session selection */}
          <Paper sx={{ flex: 1, p: 3, overflow: 'auto' }}>
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
