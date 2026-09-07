'use client';

import { useState, useMemo } from 'react';
import { Box, Typography, Alert, CircularProgress, Grid } from '@mui/material';
import { gql, TypedDocumentNode } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { useTranslations } from 'next-intl';
import { useEvent } from '../../components/event-context';
import { usePageData } from '../../hooks/use-page-data';
import {
  GET_PRACTICE_TABLES_CONFIG,
  GET_PRACTICE_TABLE_ASSIGNMENTS,
  CREATE_PRACTICE_TABLE_ASSIGNMENT,
  DELETE_PRACTICE_TABLE_ASSIGNMENT
} from './graphql';
import { createPracticeTableAssignmentsSubscription } from './graphql/subscriptions';
import { ScheduleGrid } from './components/schedule-grid';
import { TeamSearchBar } from './components/team-search-bar';
import { NoConfiguration } from './components/no-configuration';
import { NoTeams } from './components/no-teams';

interface Team {
  id: string;
  number: number;
  name: string;
  affiliation?: string;
  logoUrl?: string;
}

interface QueryData {
  division?: { id: string; teams: Team[] } | null;
}

interface QueryVars {
  divisionId: string;
}

interface EventQueryData {
  event?: { id: string; startDate: string } | null;
}

interface EventQueryVars {
  eventId: string;
}

const GET_DIVISION_TEAMS: TypedDocumentNode<QueryData, QueryVars> = gql`
  query GetDivisionTeams($divisionId: String!) {
    division(id: $divisionId) {
      id
      teams {
        id
        number
        name
        affiliation
        logoUrl
      }
    }
  }
`;

const GET_EVENT_DATE: TypedDocumentNode<EventQueryData, EventQueryVars> = gql`
  query GetEventDate($eventId: String!) {
    event(id: $eventId) {
      id
      startDate
    }
  }
`;

export default function PracticeTablesManagerPage() {
  const t = useTranslations('pages.practice-tables-manager');
  const { currentDivision, eventId } = useEvent();

  const assignmentsSubscriptions = useMemo(
    () => [createPracticeTableAssignmentsSubscription(currentDivision.id)],
    [currentDivision.id]
  );

  const { data, loading, error } = usePageData(
    GET_PRACTICE_TABLES_CONFIG,
    { divisionId: currentDivision.id },
    data => data
  );

  const {
    data: assignmentsData,
    loading: assignmentsLoading,
    refetch: refetchAssignments
  } = usePageData(
    GET_PRACTICE_TABLE_ASSIGNMENTS,
    { divisionId: currentDivision.id },
    data => data,
    assignmentsSubscriptions
  );

  const { data: teamsData, loading: teamsLoading } = usePageData(
    GET_DIVISION_TEAMS,
    { divisionId: currentDivision.id },
    data => data
  );

  const { data: eventData, loading: eventLoading } = usePageData(
    GET_EVENT_DATE,
    { eventId },
    data => data
  );

  const config = data?.practiceTablesConfig;
  const teams = teamsData?.division?.teams || [];
  const eventStartDate = eventData?.event?.startDate;

  const [createAssignment] = useMutation(CREATE_PRACTICE_TABLE_ASSIGNMENT, {
    onError: error => {
      console.error('Failed to create assignment:', error);
      alert(`Failed to create assignment: ${error.message}`);
    }
  });
  const [deleteAssignment] = useMutation(DELETE_PRACTICE_TABLE_ASSIGNMENT, {
    onError: error => {
      console.error('Failed to delete assignment:', error);
      alert(`Failed to delete assignment: ${error.message}`);
    }
  });

  // State for selected cell
  const [selectedCell, setSelectedCell] = useState<{ tableIndex: number; time: string } | null>(
    null
  );

  // Memoize server assignments to prevent unnecessary recalculations
  const serverAssignments = useMemo(
    () => assignmentsData?.practiceTableAssignments || [],
    [assignmentsData?.practiceTableAssignments]
  );

  // Convert server assignments to grid format
  const assignments = useMemo(() => {
    const result: Record<string, Record<string, Team>> = {};
    serverAssignments.forEach(assignment => {
      const tableIndex = assignment.tableNumber - 1; // Convert to 0-based
      if (!result[tableIndex]) {
        result[tableIndex] = {};
      }
      // Convert ISO timestamp to HH:MM format for grid matching (use UTC to avoid timezone issues)
      const startDate = new Date(assignment.startTime);
      const hours = startDate.getUTCHours().toString().padStart(2, '0');
      const minutes = startDate.getUTCMinutes().toString().padStart(2, '0');
      const timeKey = `${hours}:${minutes}`;

      result[tableIndex][timeKey] = assignment.team;
    });
    return result;
  }, [serverAssignments]);

  const handleCellSelect = (tableIndex: number, time: string) => {
    // Toggle selection: if clicking the same cell, deselect it
    if (selectedCell?.tableIndex === tableIndex && selectedCell?.time === time) {
      setSelectedCell(null);
    } else {
      setSelectedCell({ tableIndex, time });
    }
  };

  const handleAssign = async (team: Team) => {
    if (!selectedCell || !config || !eventStartDate) {
      console.log('Cannot assign: missing data', { selectedCell, config, eventStartDate });
      return;
    }

    console.log('Assigning team:', {
      team,
      selectedCell,
      divisionId: currentDivision.id
    });

    try {
      // Calculate end time based on slot duration
      const [hours, minutes] = selectedCell.time.split(':').map(Number);
      const startMinutes = hours * 60 + minutes;
      const endMinutes = startMinutes + config.slotDurationMinutes;
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      const endTimeStr = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;

      // Use the event's start date to create proper timestamps
      const eventDate = new Date(eventStartDate);
      const year = eventDate.getFullYear();
      const month = (eventDate.getMonth() + 1).toString().padStart(2, '0');
      const day = eventDate.getDate().toString().padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const startTime = `${dateStr}T${selectedCell.time}:00.000Z`;
      const endTime = `${dateStr}T${endTimeStr}:00.000Z`;

      console.log('Creating assignment with:', {
        divisionId: currentDivision.id,
        teamId: team.id,
        tableNumber: selectedCell.tableIndex + 1,
        startTime,
        endTime
      });

      const result = await createAssignment({
        variables: {
          input: {
            divisionId: currentDivision.id,
            teamId: team.id,
            tableNumber: selectedCell.tableIndex + 1, // Convert to 1-based
            startTime,
            endTime
          }
        }
      });

      console.log('Assignment created successfully:', result);

      // Refetch assignments to update the grid
      await refetchAssignments();
      console.log('Assignments refetched');

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
    // Find the assignment ID by matching table number and converting ISO time to HH:MM
    const assignment = serverAssignments.find(a => {
      if (a.tableNumber !== tableIndex + 1) return false;

      const startDate = new Date(a.startTime);
      const hours = startDate.getUTCHours().toString().padStart(2, '0');
      const minutes = startDate.getUTCMinutes().toString().padStart(2, '0');
      const timeKey = `${hours}:${minutes}`;

      return timeKey === time;
    });

    if (!assignment) {
      console.log('No assignment found to delete', { tableIndex, time });
      return;
    }

    try {
      console.log('Deleting assignment:', assignment.id);
      await deleteAssignment({
        variables: {
          assignmentId: assignment.id
        }
      });

      // Refetch assignments to update the grid
      await refetchAssignments();
      console.log('Assignment deleted and refetched');

      // Clear selection after successful deletion
      setSelectedCell(null);
    } catch (error) {
      console.error('Failed to delete assignment:', error);
      alert(
        `${t('errors.delete-failed')}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  if (loading || teamsLoading || assignmentsLoading || eventLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load practice tables configuration</Alert>
      </Box>
    );
  }

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
            assignments={assignments}
            onClearAssignment={handleClearAssignment}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
