'use client';

import { useEffect, useCallback, useMemo } from 'react';
import type { Dispatch } from 'react';
import { useTranslations } from 'next-intl';
import { Paper, Tabs, Tab, Box, useMediaQuery, useTheme } from '@mui/material';
import { useMatchTranslations } from '@lems/localization';
import type { TournamentManagerData } from '../graphql';
import type { TournamentManagerAction } from '../context';
import { useTeamOperations } from '../hooks/useTeamOperations';
import { useTournamentManager } from '../context';
import { calculateMissingTeams, createMissingTeamSlot } from '../utils';
import { FieldScheduleTable } from './field-schedule-table';
import { JudgingScheduleTable } from './judging-schedule-table';
import { TeamSelectionDrawer } from './team-selection-drawer';
import { MissingTeamsAlert } from './missing-teams-alert';
import type { SlotInfo } from './types';
import {
  isSlotBlockedForSelection,
  isSlotBlockedAsDestination,
  isSlotCurrentlyLoaded
} from './types';
import { DRAWER_WIDTH_PX, MOBILE_DRAWER_HEIGHT_VH } from './constants';

interface ScheduleReferenceProps {
  division: TournamentManagerData['division'];
}

const clearSelection = (dispatch: Dispatch<TournamentManagerAction>): void => {
  dispatch({ type: 'SELECT_SLOT', payload: null });
  dispatch({ type: 'SELECT_SECOND_SLOT', payload: null });
};

export function ScheduleReference({ division }: ScheduleReferenceProps) {
  const t = useTranslations('pages.tournament-manager');
  const { getStage } = useMatchTranslations();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const {
    activeTab,
    selectedSlot,
    secondSlot,
    currentRoundMatches,
    currentRoundTitle,
    missingTeams,
    roundSelector,
    dispatch
  } = useTournamentManager();

  const { handleMove, handleReplace, clearTeam, error, setError } = useTeamOperations(
    division.id,
    division
  );

  // Update missing teams when tab or round changes
  useEffect(() => {
    const teams = calculateMissingTeams(
      division.teams ?? [],
      activeTab,
      currentRoundMatches,
      division.judging.sessions
    );
    dispatch({ type: 'SET_MISSING_TEAMS', payload: teams });
  }, [activeTab, currentRoundMatches, division, dispatch]);

  // Clear selection when switching tabs
  useEffect(() => {
    clearSelection(dispatch);
  }, [activeTab, dispatch]);

  // Memoized round change handler
  const handleRoundChange = useCallback(
    (matches: TournamentManagerData['division']['field']['matches'], title: string) => {
      clearSelection(dispatch);
      dispatch({ type: 'SET_CURRENT_ROUND_MATCHES', payload: matches });
      dispatch({ type: 'SET_CURRENT_ROUND_TITLE', payload: title });
    },
    [dispatch]
  );

  // Memoized slot click handler
  const handleSlotClick = useCallback(
    (slot: SlotInfo) => {
      if (!selectedSlot) {
        if (!isSlotBlockedForSelection(slot, division) && !isSlotCurrentlyLoaded(slot, division)) {
          if (slot.team) {
            dispatch({ type: 'SELECT_SLOT', payload: slot });
          }
        }
      } else if (
        (slot.type === 'match' && selectedSlot.participantId !== slot.participantId) ||
        (slot.type === 'session' && selectedSlot.sessionId !== slot.sessionId)
      ) {
        if (!isSlotBlockedAsDestination(slot, division) && !isSlotCurrentlyLoaded(slot, division)) {
          dispatch({ type: 'SELECT_SECOND_SLOT', payload: slot });
        }
      }
    },
    [selectedSlot, dispatch, division]
  );

  // Memoized operation wrapper for consistent error handling
  const handleOperationWrapper = useCallback(
    async (operation: () => Promise<void>) => {
      try {
        await operation();
        clearSelection(dispatch);
      } catch {
        // Error already set by hook
      }
    },
    [dispatch]
  );

  // Memoized handlers for each operation
  const handleMoveClick = useCallback(
    () => handleOperationWrapper(() => handleMove(selectedSlot, secondSlot)),
    [handleOperationWrapper, handleMove, selectedSlot, secondSlot]
  );

  const handleReplaceClick = useCallback(
    () => handleOperationWrapper(() => handleReplace(selectedSlot, secondSlot)),
    [handleOperationWrapper, handleReplace, selectedSlot, secondSlot]
  );

  const handleClearClick = useCallback(
    () => handleOperationWrapper(() => clearTeam(selectedSlot)),
    [handleOperationWrapper, clearTeam, selectedSlot]
  );

  const handleDrawerClose = useCallback(() => {
    clearSelection(dispatch);
  }, [dispatch]);

  // Memoized tab change handler
  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, newValue: number) => {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: newValue });
    },
    [dispatch]
  );

  // Memoized round selector renderer
  const handleRoundSelector = useCallback(
    (selector: React.ReactNode) => {
      dispatch({ type: 'SET_ROUND_SELECTOR', payload: selector });
    },
    [dispatch]
  );

  // Memoized team click handler in missing teams alert
  const handleTeamClick = useCallback(
    (team: TournamentManagerData['division']['teams'][0]) => {
      const slot = createMissingTeamSlot(team, activeTab);
      dispatch({ type: 'SELECT_SLOT', payload: slot });
      dispatch({ type: 'SELECT_SECOND_SLOT', payload: null });
    },
    [activeTab, dispatch]
  );

  const tables = useMemo(() => division.tables ?? [], [division.tables]);
  const rooms = useMemo(() => division.rooms ?? [], [division.rooms]);

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
          marginRight: selectedSlot && !isMobile ? `${DRAWER_WIDTH_PX}px` : 0,
          marginBottom: selectedSlot && isMobile ? `${MOBILE_DRAWER_HEIGHT_VH}vh` : 0
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
              onTeamClick={handleTeamClick}
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
          onChange={handleTabChange}
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
              division={division}
              isMobile={isMobile}
              onSlotClick={handleSlotClick}
              onRoundChange={handleRoundChange}
              renderRoundSelector={handleRoundSelector}
              getStage={getStage}
            />
          )}

          {activeTab === 1 && (
            <JudgingScheduleTable
              sessions={division.judging.sessions}
              sessionLength={division.judging.sessionLength}
              rooms={rooms}
              selectedSlot={selectedSlot}
              secondSlot={secondSlot}
              division={division}
              isMobile={isMobile}
              onSlotClick={handleSlotClick}
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
        onClose={handleDrawerClose}
        onMove={handleMoveClick}
        onReplace={handleReplaceClick}
        onClear={handleClearClick}
        onClearError={() => setError(null)}
        getStage={getStage}
      />
    </Paper>
  );
}
