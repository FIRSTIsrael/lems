'use client';

import { useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Paper, Tabs, Tab, Box, useMediaQuery, useTheme } from '@mui/material';
import { SourceType } from '../types';
import type { TournamentManagerData } from '../../graphql';
import { useTournamentManager } from '../../context';
import { useSlotOperations } from '../../hooks/useSlotOperations';
import { TeamSelectionDrawer } from '../team-selection-drawer';
import { MissingTeamsAlert } from '../missing-teams-alert';
import { DRAWER_WIDTH_PX, MOBILE_DRAWER_HEIGHT_VH } from '../constants';
import { FieldScheduleTable } from './field-schedule-table';
import { JudgingScheduleTable } from './judging-schedule-table';
import { calculateMissingTeams, createMissingTeamSlot } from './utils';

export function ScheduleReference() {
  const t = useTranslations('pages.tournament-manager');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const {
    division,
    activeTab,
    selectedSlot,
    secondSlot,
    currentRoundMatches,
    currentRoundTitle,
    missingTeams,
    roundSelector,
    dispatch,
    operations,
    setError
  } = useTournamentManager();

  const { clearSelection } = useSlotOperations(division, dispatch);

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
    clearSelection();
  }, [activeTab, clearSelection]);

  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, newValue: number) => {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: newValue });
    },
    [dispatch]
  );

  const handleTeamClick = useCallback(
    (team: TournamentManagerData['division']['teams'][0]) => {
      const slot = createMissingTeamSlot(team, activeTab);
      dispatch({ type: 'SELECT_SLOT', payload: slot });
      dispatch({ type: 'SET_SOURCE_TYPE', payload: SourceType.MISSING_TEAM });
      dispatch({ type: 'SELECT_SECOND_SLOT', payload: null });
    },
    [activeTab, dispatch]
  );

  const handleMoveClick = useCallback(async () => {
    try {
      await operations.handleMove(selectedSlot, secondSlot);
      clearSelection();
    } catch {
      // Error already set by operations
    }
  }, [operations, selectedSlot, secondSlot, clearSelection]);

  const handleReplaceClick = useCallback(async () => {
    try {
      await operations.handleReplace(selectedSlot, secondSlot);
      clearSelection();
    } catch {
      // Error already set by operations
    }
  }, [operations, selectedSlot, secondSlot, clearSelection]);

  const handleClearClick = useCallback(async () => {
    try {
      await operations.clearTeam(selectedSlot);
      clearSelection();
    } catch {
      // Error already set by operations
    }
  }, [operations, selectedSlot, clearSelection]);

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
        {(activeTab === 0 || activeTab === 1) &&
          (missingTeams.length > 0 || (activeTab === 0 && roundSelector)) && (
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
              {activeTab === 0 && roundSelector && (
                <Box sx={{ display: 'flex', alignItems: 'center', pt: 0.5, order: 2 }}>
                  {roundSelector}
                </Box>
              )}
              <MissingTeamsAlert
                missingTeams={missingTeams}
                currentRoundTitle={currentRoundTitle}
                selectedSlotTeamId={selectedSlot?.team?.id}
                onTeamClick={handleTeamClick}
              />
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
          <Tab label={t('match-schedule.title')} />
          <Tab label={t('judging-schedule.title')} />
        </Tabs>

        <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.paper' }}>
          {activeTab === 0 && <FieldScheduleTable isMobile={isMobile} />}
          {activeTab === 1 && <JudgingScheduleTable isMobile={isMobile} />}
        </Box>
      </Box>

      <TeamSelectionDrawer
        open={!!selectedSlot}
        isMobile={isMobile}
        onClose={clearSelection}
        onMove={handleMoveClick}
        onReplace={handleReplaceClick}
        onClear={handleClearClick}
        onClearError={() => setError(null)}
      />
    </Paper>
  );
}
