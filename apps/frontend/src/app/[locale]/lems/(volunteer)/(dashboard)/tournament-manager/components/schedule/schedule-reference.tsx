'use client';

import { useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Paper, Tabs, Tab, Box, useMediaQuery, useTheme } from '@mui/material';
import { useMatchTranslations } from '@lems/localization';
import type { TournamentManagerData } from '../../graphql';
import { useTournamentManager } from '../../context';
import { useScheduleOperations } from '../../hooks/useScheduleOperations';
import { TeamSelectionDrawer } from '../team-selection-drawer';
import { MissingTeamsAlert } from '../missing-teams-alert';
import { DRAWER_WIDTH_PX, MOBILE_DRAWER_HEIGHT_VH } from '../constants';
import { FieldScheduleTable } from './field-schedule-table';
import { JudgingScheduleTable } from './judging-schedule-table';
import { calculateMissingTeams } from './utils';

interface ScheduleReferenceProps {
  division: TournamentManagerData['division'];
}

export function ScheduleReference({ division }: ScheduleReferenceProps) {
  const t = useTranslations('pages.tournament-manager');
  const { getStage } = useMatchTranslations();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const {
    activeTab,
    selectedSlot,
    sourceType,
    secondSlot,
    currentRoundMatches,
    currentRoundTitle,
    missingTeams,
    roundSelector,
    dispatch
  } = useTournamentManager();

  const {
    handleRoundChange,
    handleSlotClick,
    handleMoveClick,
    handleReplaceClick,
    handleClearClick,
    handleDrawerClose,
    handleTabChange,
    handleRoundSelector,
    handleTeamClick,
    error,
    setError
  } = useScheduleOperations(division);

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
    dispatch({ type: 'SELECT_SLOT', payload: null });
    dispatch({ type: 'SET_SOURCE_TYPE', payload: null });
    dispatch({ type: 'SELECT_SECOND_SLOT', payload: null });
  }, [activeTab, dispatch]);

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
          {activeTab === 0 && (
            <FieldScheduleTable
              matches={division.field.matches}
              tables={tables}
              selectedSlot={selectedSlot}
              sourceType={sourceType}
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
              sourceType={sourceType}
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
        sourceType={sourceType}
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
