'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Stack,
  Alert,
  Typography,
  Paper,
  Fab,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import dayjs from 'dayjs';
import { useEvent } from '../../components/event-context';
import { PageHeader } from '../components/page-header';
import { useTime } from '../../../../../../lib/time/hooks/use-time';
import { usePageData } from '../../hooks/use-page-data';
import {
  GET_FIELD_QUEUER_DATA,
  parseFieldQueuerData,
  type FieldQueuerData,
  type QueryData,
  type QueryVars
} from './graphql/index';
import {
  createMatchCallUpdatedSubscription,
  createMatchParticipantUpdatedSubscription
} from './graphql/subscriptions';
import { TeamQueueCard } from './components';

export default function FieldQueuerPage() {
  const t = useTranslations('pages.field-queuer');
  const { currentDivision } = useEvent();
  const [selectedTable, setSelectedTable] = useState<string>('all');
  const currentTime = useTime({ interval: 1000 });

  const subscriptions = useMemo(
    () => [
      createMatchCallUpdatedSubscription(currentDivision.id),
      createMatchParticipantUpdatedSubscription(currentDivision.id)
    ],
    [currentDivision.id]
  );

  const { data, loading, error } = usePageData<
    QueryData,
    QueryVars,
    FieldQueuerData,
    { divisionId: string }
  >(GET_FIELD_QUEUER_DATA, { divisionId: currentDivision.id }, parseFieldQueuerData, subscriptions);

  const safeData = data ?? {
    matches: [],
    sessions: [],
    loadedMatch: null
  };

  const tables = useMemo(() => {
    const tableSet = new Set<string>();
    safeData.matches.forEach(match => {
      match.participants.forEach(p => {
        if (p.table) tableSet.add(p.table.name);
      });
    });
    return Array.from(tableSet).sort();
  }, [safeData.matches]);

  const calledTeams = useMemo(() => {
    const teams: Array<{
      teamNumber: number;
      teamName: string;
      tableName: string;
      matchNumber: number;
      scheduledTime: string;
      isInJudging: boolean;
      isUrgent: boolean;
      teamId: string;
      tableId: string;
    }> = [];

    const calledMatches = safeData.matches.filter(m => m.called && m.status === 'not-started');

    const activeSessions = safeData.sessions.filter(
      s => s.status === 'in-progress' || (s.status === 'not-started' && s.called)
    );

    calledMatches.forEach(match => {
      match.participants
        .filter(p => p.team && !p.queued && p.team.arrived)
        .forEach(participant => {
          if (!participant.team || !participant.table) return;

          const isInJudging = activeSessions.some(s => s.team?.id === participant.team?.id);
          const minutesUntilMatch = currentTime.diff(dayjs(match.scheduledTime), 'minute');
          const isUrgent = minutesUntilMatch >= -10;

          teams.push({
            teamNumber: participant.team.number,
            teamName: participant.team.name,
            tableName: participant.table.name,
            matchNumber: match.number,
            scheduledTime: match.scheduledTime,
            isInJudging,
            isUrgent,
            teamId: participant.team.id,
            tableId: participant.table.id
          });
        });
    });

    teams.sort((a, b) => {
      if (a.isUrgent !== b.isUrgent) return a.isUrgent ? -1 : 1;
      if (a.isInJudging !== b.isInJudging) return a.isInJudging ? 1 : -1;
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });

    return teams;
  }, [safeData.matches, safeData.sessions, currentTime]);

  const filteredTeams = useMemo(() => {
    if (selectedTable === 'all') return calledTeams;
    return calledTeams.filter(team => team.tableName === selectedTable);
  }, [calledTeams, selectedTable]);

  return (
    <>
      <PageHeader title={t('page-title')}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t('filter-by-table')}</InputLabel>
          <Select
            value={selectedTable}
            label={t('filter-by-table')}
            onChange={e => setSelectedTable(e.target.value)}
          >
            <MenuItem value="all">{t('all-tables')}</MenuItem>
            {tables.map(table => (
              <MenuItem key={table} value={table}>
                {table}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </PageHeader>

      <Stack spacing={3} sx={{ pt: 3 }}>
        {error && <Alert severity="error">{error.message}</Alert>}
        {!loading && !data && (
          <Alert severity="info">
            No data loaded yet. Check that the backend GraphQL server is running.
          </Alert>
        )}

        {!loading && filteredTeams.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              {t('no-teams')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t('no-teams-description')}
            </Typography>
          </Paper>
        )}

        {filteredTeams.map(team => (
          <TeamQueueCard
            key={team.teamId}
            teamNumber={team.teamNumber}
            teamName={team.teamName}
            tableName={team.tableName}
            matchNumber={team.matchNumber}
            scheduledTime={team.scheduledTime}
            isInJudging={team.isInJudging}
            isUrgent={team.isUrgent}
          />
        ))}
      </Stack>

      <Fab
        color="primary"
        component="a"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16
        }}
        href={`/lems/reports/field-schedule`}
        target="_blank"
      >
        <CalendarMonthOutlinedIcon />
      </Fab>

      <Fab
        color="secondary"
        component="a"
        sx={{
          position: 'fixed',
          bottom: 88,
          right: 16
        }}
        href={`/lems/reports/pit-map`}
        target="_blank"
      >
        <MapOutlinedIcon />
      </Fab>
    </>
  );
}
