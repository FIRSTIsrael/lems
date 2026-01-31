'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation } from '@apollo/client/react';
import { Paper, Tabs, Tab, Box, useMediaQuery, useTheme } from '@mui/material';
import { useMatchTranslations } from '@lems/localization';
import type { TournamentManagerData } from '../graphql';
import {
  SWAP_MATCH_TEAMS,
  SWAP_SESSION_TEAMS,
  SET_MATCH_PARTICIPANT_TEAM,
  GET_TOURNAMENT_MANAGER_DATA
} from '../graphql';
import { FieldScheduleTable } from './field-schedule-table';
import { JudgingScheduleTable } from './judging-schedule-table';
import { TeamSelectionDrawer } from './team-selection-drawer';
import type { SlotInfo } from './types';

interface ScheduleReferenceProps {
  division: TournamentManagerData['division'];
}

export function ScheduleReference({ division }: ScheduleReferenceProps) {
  const t = useTranslations('pages.tournament-manager');
  const { getStage } = useMatchTranslations();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
  const [secondSlot, setSecondSlot] = useState<SlotInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg')); // lg = 1200px, includes tablets/iPad

  const [swapMatchTeams] = useMutation(SWAP_MATCH_TEAMS, {
    refetchQueries: [{ query: GET_TOURNAMENT_MANAGER_DATA, variables: { divisionId: division.id } }]
  });

  const [swapSessionTeams] = useMutation(SWAP_SESSION_TEAMS, {
    refetchQueries: [{ query: GET_TOURNAMENT_MANAGER_DATA, variables: { divisionId: division.id } }]
  });

  const [setMatchParticipantTeam] = useMutation(SET_MATCH_PARTICIPANT_TEAM, {
    refetchQueries: [{ query: GET_TOURNAMENT_MANAGER_DATA, variables: { divisionId: division.id } }]
  });

  const handleMove = async () => {
    if (!selectedSlot || !secondSlot) return;

    setError(null);
    try {
      if (selectedSlot.type === 'match' && secondSlot.type === 'match') {
        if (
          !selectedSlot.participantId ||
          !secondSlot.participantId ||
          !selectedSlot.matchId ||
          !secondSlot.matchId
        )
          return;

        await setMatchParticipantTeam({
          variables: {
            divisionId: division.id,
            matchId: secondSlot.matchId,
            participantId: secondSlot.participantId,
            teamId: selectedSlot.team?.id || null
          }
        });

        await setMatchParticipantTeam({
          variables: {
            divisionId: division.id,
            matchId: selectedSlot.matchId,
            participantId: selectedSlot.participantId,
            teamId: null
          }
        });
      }

      setSelectedSlot(null);
      setSecondSlot(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move team');
    }
  };

  const handleReplace = async () => {
    if (!selectedSlot || !secondSlot) return;

    setError(null);
    try {
      if (selectedSlot.type === 'match' && secondSlot.type === 'match') {
        if (
          !selectedSlot.participantId ||
          !secondSlot.participantId ||
          !selectedSlot.matchId ||
          !secondSlot.matchId
        )
          return;

        // Check if both teams are in the same match
        if (selectedSlot.matchId === secondSlot.matchId) {
          // Use swapMatchTeams for teams in the same match
          await swapMatchTeams({
            variables: {
              divisionId: division.id,
              matchId: selectedSlot.matchId,
              participantId1: selectedSlot.participantId,
              participantId2: secondSlot.participantId
            }
          });
        } else {
          // Swap teams across different matches
          const team1 = selectedSlot.team;
          const team2 = secondSlot.team;

          // Assign team1 to second slot
          await setMatchParticipantTeam({
            variables: {
              divisionId: division.id,
              matchId: secondSlot.matchId,
              participantId: secondSlot.participantId,
              teamId: team1?.id || null
            }
          });

          // Assign team2 to first slot
          await setMatchParticipantTeam({
            variables: {
              divisionId: division.id,
              matchId: selectedSlot.matchId,
              participantId: selectedSlot.participantId,
              teamId: team2?.id || null
            }
          });
        }
      } else if (selectedSlot.type === 'session' && secondSlot.type === 'session') {
        if (!selectedSlot.sessionId || !secondSlot.sessionId) return;

        await swapSessionTeams({
          variables: {
            divisionId: division.id,
            sessionId1: selectedSlot.sessionId,
            sessionId2: secondSlot.sessionId
          }
        });
      }

      setSelectedSlot(null);
      setSecondSlot(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to replace teams');
    }
  };

  const tables = division.tables || [];
  const rooms = division.rooms || [];

  const handleSlotClick = (slot: SlotInfo) => {
    if (!selectedSlot) {
      if (slot.team) {
        setSelectedSlot(slot);
      }
    } else if (
      (slot.type === 'match' && selectedSlot.participantId !== slot.participantId) ||
      (slot.type === 'session' && selectedSlot.sessionId !== slot.sessionId)
    ) {
      setSecondSlot(slot);
    }
  };

  const handleCloseDrawer = () => {
    setSelectedSlot(null);
    setSecondSlot(null);
  };

  return (
    <Paper
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 2
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          transition: isMobile ? 'margin-bottom 0.3s' : 'margin-right 0.3s',
          marginRight: selectedSlot && !isMobile ? '400px' : 0,
          marginBottom: selectedSlot && isMobile ? '60vh' : 0
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.default',
            '& .MuiTab-root': {
              fontWeight: 600,
              fontSize: '0.9rem',
              py: 2
            }
          }}
        >
          <Tab label={t('match-schedule')} />
          <Tab label={t('judging-schedule')} />
        </Tabs>

        <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.paper' }}>
          {activeTab === 0 && (
            <FieldScheduleTable
              matches={division.field.matches}
              tables={tables}
              selectedSlot={selectedSlot}
              secondSlot={secondSlot}
              isMobile={isMobile}
              onSlotClick={handleSlotClick}
              getStage={getStage}
              t={t}
            />
          )}

          {activeTab === 1 && (
            <JudgingScheduleTable
              sessions={division.judging.sessions}
              sessionLength={division.judging.sessionLength}
              rooms={rooms}
              selectedSlot={selectedSlot}
              secondSlot={secondSlot}
              isMobile={isMobile}
              onSlotClick={handleSlotClick}
              t={t}
            />
          )}
        </Box>
      </Box>

      <TeamSelectionDrawer
        open={!!selectedSlot}
        selectedSlot={selectedSlot}
        secondSlot={secondSlot}
        error={error}
        isMobile={isMobile}
        division={division}
        onClose={handleCloseDrawer}
        onMove={handleMove}
        onReplace={handleReplace}
        onClearError={() => setError(null)}
        getStage={getStage}
        t={t}
      />
    </Paper>
  );
}
