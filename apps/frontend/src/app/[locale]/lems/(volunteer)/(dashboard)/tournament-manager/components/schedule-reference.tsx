'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Paper, Tabs, Tab, Box, useMediaQuery, useTheme } from '@mui/material';
import { useMatchTranslations } from '@lems/localization';
import type { TournamentManagerData } from '../graphql';
import { useTeamOperations } from '../hooks/useTeamOperations';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { FieldScheduleTable } from './field-schedule-table';
import { JudgingScheduleTable } from './judging-schedule-table';
import { TeamSelectionDrawer } from './team-selection-drawer';
import { MissingTeamsAlert } from './missing-teams-alert';
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
  const [currentRoundMatches, setCurrentRoundMatches] = useState<
    TournamentManagerData['division']['field']['matches']
  >([]);
  const [currentRoundTitle, setCurrentRoundTitle] = useState<string>('');
  const [selectedMissingTeamId, setSelectedMissingTeamId] = useState<string | null>(null);
  const [roundSelector, setRoundSelector] = useState<React.ReactNode>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const { handleMove, handleReplace, assignTeamToSlot, error, setError } = useTeamOperations(
    division.id
  );
  const { draggedTeamId, handleDragStart, handleDragEnd } = useDragAndDrop();

  const handleMoveWrapper = async () => {
    try {
      await handleMove(selectedSlot, secondSlot);
      setSelectedSlot(null);
      setSecondSlot(null);
    } catch {
      // Error already set by hook
    }
  };

  const handleReplaceWrapper = async () => {
    try {
      await handleReplace(selectedSlot, secondSlot);
      setSelectedSlot(null);
      setSecondSlot(null);
    } catch {
      // Error already set by hook
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
    if (selectedMissingTeamId && !slot.team) {
      try {
        await assignTeamToSlot(selectedMissingTeamId, slot);
        setSelectedMissingTeamId(null);
      } catch {
        // Error already set by hook
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

  const handleMissingTeamClick = (team: TournamentManagerData['division']['teams'][0]) => {
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
  };

  const handleDrop = async (slot: SlotInfo) => {
    if (draggedTeamId && !slot.team) {
      try {
        await assignTeamToSlot(draggedTeamId, slot);
      } catch {
        // Error already set by hook
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
            <MissingTeamsAlert
              missingTeams={missingTeams}
              currentRoundTitle={currentRoundTitle}
              selectedSlotTeamId={selectedSlot?.team?.id}
              draggedTeamId={draggedTeamId}
              onTeamClick={handleMissingTeamClick}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onClose={() => setSelectedMissingTeamId(null)}
              t={t}
            />
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
        onMove={handleMoveWrapper}
        onReplace={handleReplaceWrapper}
        onClearError={() => setError(null)}
        getStage={getStage}
        t={t}
      />
    </Paper>
  );
}
