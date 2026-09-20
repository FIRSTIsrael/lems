'use client';

import { useState } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { useMutation } from '@apollo/client/react';
import { useTranslations } from 'next-intl';
import { UPDATE_PRACTICE_TABLE_ASSIGNMENT } from '../graphql';
import { usePracticeTablesManager } from './practice-tables-manager-context';
import { ScheduleGrid } from './schedule-grid';
import { TeamSearchBar } from './team-search-bar';
import { NoConfiguration } from './no-configuration';
import { NoTeams } from './no-teams';

export function PracticeTablesManagerContent() {
  const t = useTranslations('pages.practice-tables-manager');
  const { divisionId, eventStartDate, config, teams, assignmentsMap } = usePracticeTablesManager();

  const [updateAssignment] = useMutation(UPDATE_PRACTICE_TABLE_ASSIGNMENT, {
    onError: error => {
      console.error('Failed to update assignment:', error);
      alert(`Failed to update assignment: ${error.message}`);
    }
  });

  // State for selected cell
  const [selectedCell, setSelectedCell] = useState<{ tableIndex: number; time: string } | null>(
    null
  );

  const handleCellSelect = (tableIndex: number, time: string) => {
    setSelectedCell({ tableIndex, time });
  };

  const handleAssign = async (team: { id: string; number: number; name: string }) => {
    if (!selectedCell || !eventStartDate) return;

    try {
      // selectedCell.time is already an ISO datetime string
      const startTime = selectedCell.time;

      console.log('Creating assignment with:', {
        divisionId,
        teamId: team.id,
        tableIndex: selectedCell.tableIndex,
        startTime
      });

      await updateAssignment({
        variables: {
          input: {
            divisionId,
            teamId: team.id,
            tableIndex: selectedCell.tableIndex,
            startTime
          }
        }
      });

      // Clear selection after successful assignment
      setSelectedCell(null);
    } catch (error) {
      console.error('Failed to create assignment:', error);

      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('already has a practice table assignment')) {
        alert(t('errors.team-already-assigned'));
      } else {
        alert(`${t('errors.assignment-failed')}: ${errorMessage}`);
      }
    }
  };

  const handleClearAssignment = async (tableIndex: number, time: string) => {
    try {
      // time is already an ISO datetime string
      const startTime = time;

      console.log('Clearing assignment:', { tableIndex, time, startTime });

      await updateAssignment({
        variables: {
          input: {
            divisionId,
            teamId: null, // Set to null to unassign
            tableIndex,
            startTime
          }
        }
      });

      // Clear selection after successful deletion
      setSelectedCell(null);
    } catch (error) {
      console.error('Failed to clear assignment:', error);
      alert(
        `${t('errors.delete-failed')}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  if (!config) {
    return <NoConfiguration />;
  }

  if (teams.length === 0) {
    return <NoTeams />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('page-title')}
      </Typography>

      <Grid container spacing={3}>
        {/* Team Search Sidebar */}
        <Grid size={{ xs: 12, md: 3 }}>
          <TeamSearchBar teams={teams} selectedCell={selectedCell} onAssign={handleAssign} />
        </Grid>

        {/* Schedule Grid */}
        <Grid size={{ xs: 12, md: 9 }}>
          <ScheduleGrid
            tableCount={config.tableCount}
            slotDurationMinutes={config.slotDurationMinutes}
            startTime={config.startTime}
            endTime={config.endTime}
            blockedTimeSlots={config.blockedTimeSlots}
            selectedCell={selectedCell}
            onCellSelect={handleCellSelect}
            assignments={assignmentsMap}
            onClearAssignment={handleClearAssignment}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
