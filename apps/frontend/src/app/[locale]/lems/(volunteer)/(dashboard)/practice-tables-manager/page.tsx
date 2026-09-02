'use client';

import { useState } from 'react';
import { Box, Typography, Alert, CircularProgress, Grid } from '@mui/material';
import { gql, TypedDocumentNode } from '@apollo/client';
import { useTranslations } from 'next-intl';
import { useEvent } from '../../components/event-context';
import { usePageData } from '../../hooks/use-page-data';
import { GET_PRACTICE_TABLES_CONFIG } from './graphql';
import { ScheduleGrid } from './components/schedule-grid';
import { TeamSearchBar } from './components/team-search-bar';

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

export default function PracticeTablesManagerPage() {
  const t = useTranslations('pages.practice-tables-manager');
  const { currentDivision } = useEvent();

  const { data, loading, error } = usePageData(
    GET_PRACTICE_TABLES_CONFIG,
    { divisionId: currentDivision.id },
    data => data
  );

  const { data: teamsData, loading: teamsLoading } = usePageData(
    GET_DIVISION_TEAMS,
    { divisionId: currentDivision.id },
    data => data
  );

  const config = data?.practiceTablesConfig;
  const teams = teamsData?.division?.teams || [];

  // State for assignments and selected cell
  const [assignments, setAssignments] = useState<Record<string, Record<string, Team>>>({});
  const [selectedCell, setSelectedCell] = useState<{ tableIndex: number; time: string } | null>(
    null
  );

  const handleCellSelect = (tableIndex: number, time: string) => {
    // Toggle selection: if clicking the same cell, deselect it
    if (selectedCell?.tableIndex === tableIndex && selectedCell?.time === time) {
      setSelectedCell(null);
    } else {
      setSelectedCell({ tableIndex, time });
    }
  };

  const handleAssign = (team: Team) => {
    if (!selectedCell) return;

    setAssignments(prev => {
      const newAssignments = { ...prev };
      if (!newAssignments[selectedCell.tableIndex]) {
        newAssignments[selectedCell.tableIndex] = {};
      }
      newAssignments[selectedCell.tableIndex][selectedCell.time] = team;
      return newAssignments;
    });
  };

  const handleClearAssignment = (tableIndex: number, time: string) => {
    setAssignments(prev => {
      const newAssignments = { ...prev };
      if (newAssignments[tableIndex]) {
        delete newAssignments[tableIndex][time];
      }
      return newAssignments;
    });
  };

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}
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
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t('page-title')}
        </Typography>
        <Alert severity="info" sx={{ mt: 3 }}>
          {t('configuration.not-configured')}
        </Alert>
        <Typography variant="body1" sx={{ mt: 2 }}>
          {t('configuration.not-configured-description')}
        </Typography>
      </Box>
    );
  }

  if (!teamsLoading && teams.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t('page-title')}
        </Typography>
        <Alert severity="info" sx={{ mt: 3 }}>
          {t('no-teams.title')}
        </Alert>
        <Typography variant="body1" sx={{ mt: 2 }}>
          {t('no-teams.description')}
        </Typography>
      </Box>
    );
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
          {teamsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
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
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
