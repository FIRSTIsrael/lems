'use client';

import { useMemo } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import { gql, TypedDocumentNode } from '@apollo/client';
import { useEvent } from '../../components/event-context';
import { usePageData } from '../../hooks/use-page-data';
import { GET_PRACTICE_TABLES_CONFIG, GET_PRACTICE_TABLE_ASSIGNMENTS } from './graphql';
import { createPracticeTableAssignmentsSubscription } from './graphql/subscriptions';
import { PracticeTablesManagerProvider, PracticeTablesManagerContent } from './components';

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

  const { data: assignmentsData, loading: assignmentsLoading } = usePageData(
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

  const config = data?.division?.practiceTables?.config || null;
  const teams = teamsData?.division?.teams || [];
  const assignments = assignmentsData?.division?.practiceTables?.schedule || [];
  const eventStartDate = eventData?.event?.startDate || null;

  const isLoading = loading || teamsLoading || assignmentsLoading || eventLoading;

  if (isLoading) {
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

  return (
    <PracticeTablesManagerProvider
      divisionId={currentDivision.id}
      eventId={eventId}
      eventStartDate={eventStartDate}
      config={config}
      teams={teams}
      assignments={assignments}
      loading={isLoading}
    >
      <PracticeTablesManagerContent />
    </PracticeTablesManagerProvider>
  );
}
