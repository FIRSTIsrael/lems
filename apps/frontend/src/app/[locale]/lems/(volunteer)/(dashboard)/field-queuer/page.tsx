'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Stack, Alert, Typography, Paper, Box } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useEvent } from '../../components/event-context';
import { PageHeader } from '../components/page-header';
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
          const isUrgent = safeData.loadedMatch?.id === match.id;

          teams.push({
            teamNumber: participant.team.number,
            teamName: participant.team.name,
            tableName: participant.table.name,
            matchNumber: match.number,
            scheduledTime: match.scheduledTime,
            isInJudging,
            isUrgent,
            teamId: participant.team.id
          });
        });
    });

    teams.sort((a, b) => {
      if (a.isUrgent !== b.isUrgent) return a.isUrgent ? -1 : 1;
      if (a.isInJudging !== b.isInJudging) return a.isInJudging ? 1 : -1;
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });

    return teams;
  }, [safeData.matches, safeData.sessions, safeData.loadedMatch]);

  return (
    <>
      <PageHeader title={t('page-title')} />

      <Stack spacing={3} sx={{ pt: 3 }}>
        {error && <Alert severity="error">{error.message}</Alert>}
        {!loading && !data && (
          <Alert severity="info">
            No data loaded yet. Check that the backend GraphQL server is running.
          </Alert>
        )}

        <Paper sx={{ p: 3, bgcolor: 'info.main', color: 'info.contrastText' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <InfoOutlinedIcon />
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {t('instructions.title')}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {t('instructions.description')}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {!loading && calledTeams.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              {t('no-teams')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t('no-teams-description')}
            </Typography>
          </Paper>
        )}

        {calledTeams.map(team => (
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
    </>
  );
}
