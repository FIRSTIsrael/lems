'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation } from '@apollo/client/react';
import {
  Paper,
  Tabs,
  Tab,
  Box,
  useMediaQuery,
  useTheme,
  Alert,
  AlertTitle,
  Chip,
  Stack
} from '@mui/material';
import { useMatchTranslations } from '@lems/localization';
import type { TournamentManagerData } from '../graphql';
import {
  SWAP_MATCH_TEAMS,
  SWAP_SESSION_TEAMS,
  SET_MATCH_PARTICIPANT_TEAM,
  SET_JUDGING_SESSION_TEAM,
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
  const [currentRoundMatches, setCurrentRoundMatches] = useState<
    TournamentManagerData['division']['field']['matches']
  >([]);
  const [currentRoundTitle, setCurrentRoundTitle] = useState<string>('');
  const [selectedMissingTeamId, setSelectedMissingTeamId] = useState<string | null>(null);
  const [draggedTeamId, setDraggedTeamId] = useState<string | null>(null);
  const [roundSelector, setRoundSelector] = useState<React.ReactNode>(null);
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

  const [setJudgingSessionTeam] = useMutation(SET_JUDGING_SESSION_TEAM, {
    refetchQueries: [{ query: GET_TOURNAMENT_MANAGER_DATA, variables: { divisionId: division.id } }]
  });

  const handleMove = async () => {
    if (!selectedSlot || !secondSlot) return;

    setError(null);
    try {
      if (selectedSlot.type === 'match' && secondSlot.type === 'match') {
        if (!secondSlot.participantId || !secondSlot.matchId) return;

        // Assign selected team to destination
        await setMatchParticipantTeam({
          variables: {
            divisionId: division.id,
            matchId: secondSlot.matchId,
            participantId: secondSlot.participantId,
            teamId: selectedSlot.team?.id || null
          }
        });

        // Clear original slot only if it has a matchId (not from warning alert)
        if (selectedSlot.matchId && selectedSlot.participantId) {
          await setMatchParticipantTeam({
            variables: {
              divisionId: division.id,
              matchId: selectedSlot.matchId,
              participantId: selectedSlot.participantId,
              teamId: null
            }
          });
        }
      } else if (selectedSlot.type === 'session' && secondSlot.type === 'session') {
        if (!secondSlot.sessionId) return;

        // Assign selected team to destination session
        await setJudgingSessionTeam({
          variables: {
            divisionId: division.id,
            sessionId: secondSlot.sessionId,
            teamId: selectedSlot.team?.id || null
          }
        });

        // Clear original session only if it has a sessionId (not from warning alert)
        if (selectedSlot.sessionId) {
          await setJudgingSessionTeam({
            variables: {
              divisionId: division.id,
              sessionId: selectedSlot.sessionId,
              teamId: null
            }
          });
        }
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
        if (!secondSlot.sessionId) return;

        // If selected slot has no sessionId (from warning alert), just assign to destination
        if (!selectedSlot.sessionId) {
          await setJudgingSessionTeam({
            variables: {
              divisionId: division.id,
              sessionId: secondSlot.sessionId,
              teamId: selectedSlot.team?.id || null
            }
          });
        } else {
          // Both have sessionIds, use swap
          await swapSessionTeams({
            variables: {
              divisionId: division.id,
              sessionId1: selectedSlot.sessionId,
              sessionId2: secondSlot.sessionId
            }
          });
        }
      }

      setSelectedSlot(null);
      setSecondSlot(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to replace teams');
    }
  };

  const tables = division.tables || [];
  const rooms = division.rooms || [];

  // Calculate missing teams for current round
  const getMissingTeams = () => {
    const allTeams = division.teams || [];
    const assignedTeamIds = new Set<string>();

    if (activeTab === 0) {
      // Field schedule - get teams from current round only
      currentRoundMatches.forEach(match => {
        match.participants.forEach(p => {
          if (p.team) assignedTeamIds.add(p.team.id);
        });
      });
    } else {
      // Judging schedule - get teams from all sessions
      division.judging.sessions.forEach(session => {
        if (session.team) assignedTeamIds.add(session.team.id);
      });
    }

    return allTeams.filter(team => !assignedTeamIds.has(team.id));
  };

  const missingTeams = getMissingTeams();

  const handleSlotClick = async (slot: SlotInfo) => {
    // If a missing team is selected, assign it to the clicked empty slot
    if (selectedMissingTeamId && !slot.team) {
      try {
        if (slot.type === 'match' && slot.participantId && slot.matchId) {
          await setMatchParticipantTeam({
            variables: {
              divisionId: division.id,
              matchId: slot.matchId,
              participantId: slot.participantId,
              teamId: selectedMissingTeamId
            }
          });
          setSelectedMissingTeamId(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to assign team');
      }
      return;
    }

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

  const handleDragStart = (teamId: string) => {
    setDraggedTeamId(teamId);
  };

  const handleDragEnd = () => {
    setDraggedTeamId(null);
  };

  const handleDrop = async (slot: SlotInfo) => {
    if (draggedTeamId && !slot.team) {
      try {
        if (slot.type === 'match' && slot.participantId && slot.matchId) {
          await setMatchParticipantTeam({
            variables: {
              divisionId: division.id,
              matchId: slot.matchId,
              participantId: slot.participantId,
              teamId: draggedTeamId
            }
          });
          setDraggedTeamId(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to assign team');
      }
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
        {activeTab === 0 && (missingTeams.length > 0 || roundSelector) && (
          <Box
            sx={{
              m: 2,
              mb: 0,
              display: 'flex',
              gap: 2,
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              justifyContent: 'space-between'
            }}
          >
            {missingTeams.length > 0 && (
              <Alert
                severity="warning"
                sx={{ flex: 1, minWidth: 300, order: 1 }}
                onClose={() => setSelectedMissingTeamId(null)}
              >
                <AlertTitle sx={{ mb: 0.5 }}>
                  {currentRoundTitle
                    ? `${t('missing-teams-from-round')}: ${currentRoundTitle}`
                    : t('missing-teams-title')}
                </AlertTitle>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {missingTeams.map(team => (
                    <Chip
                      key={team.id}
                      label={`#${team.number} ${team.name}`}
                      size="small"
                      color={selectedSlot?.team?.id === team.id ? 'primary' : 'default'}
                      onClick={() => {
                        const slot: SlotInfo = {
                          type: activeTab === 0 ? 'match' : 'session',
                          team: team,
                          matchId: undefined,
                          participantId: undefined,
                          sessionId: undefined,
                          tableName: undefined,
                          roomName: undefined,
                          time: undefined
                        };
                        setSelectedSlot(slot);
                        setSecondSlot(null);
                      }}
                      draggable
                      onDragStart={() => handleDragStart(team.id)}
                      onDragEnd={handleDragEnd}
                      sx={{
                        cursor: draggedTeamId === team.id ? 'grabbing' : 'grab',
                        opacity: draggedTeamId === team.id ? 0.5 : 1,
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    />
                  ))}
                </Stack>
              </Alert>
            )}
            {roundSelector && (
              <Box sx={{ display: 'flex', alignItems: 'center', pt: 0.5, order: 2 }}>
                {roundSelector}
              </Box>
            )}
          </Box>
        )}
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
              onSlotDrop={handleDrop}
              onRoundChange={(matches, title) => {
                setCurrentRoundMatches(matches);
                setCurrentRoundTitle(title);
              }}
              renderRoundSelector={setRoundSelector}
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
