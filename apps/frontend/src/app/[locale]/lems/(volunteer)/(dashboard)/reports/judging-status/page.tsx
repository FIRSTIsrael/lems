'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Box } from '@mui/material';
import { ResponsiveComponent } from '@lems/shared';
import { useEvent } from '../../../components/event-context';
import { PageHeader } from '../../components/page-header';
import { usePageData } from '../../../hooks/use-page-data';
import {
  GET_JUDGING_STATUS,
  parseJudgingStatus,
  createJudgingSessionStartedSubscription,
  createJudgingSessionCompletedSubscription,
  createJudgingSessionUpdatedSubscription,
  createTeamArrivalSubscription,
  createMatchLoadedSubscription,
  createMatchStartedSubscription
} from './graphql';
import { JudgingStatusTable } from './components/judging-status-table';
import { JudgingStatusMobile } from './components/judging-status-mobile';

export default function JudgingStatusPage() {
  const t = useTranslations('pages.judging-status');
  const { currentDivision } = useEvent();

  const subscriptions = useMemo(
    () => [
      createJudgingSessionStartedSubscription(currentDivision.id),
      createJudgingSessionCompletedSubscription(currentDivision.id),
      createJudgingSessionUpdatedSubscription(currentDivision.id),
      createTeamArrivalSubscription(currentDivision.id),
      createMatchLoadedSubscription(currentDivision.id),
      createMatchStartedSubscription(currentDivision.id)
    ],
    [currentDivision.id]
  );

  const { data, loading } = usePageData(
    GET_JUDGING_STATUS,
    { divisionId: currentDivision.id },
    undefined,
    subscriptions
  );

  const { sessions, rooms, sessionLength, field, matches } = parseJudgingStatus(data ?? {});

  // Find the current session number from sessions in progress
  const currentSessionNumber = useMemo(() => {
    const inProgressSession = sessions.find(s => s.status === 'in-progress');
    if (inProgressSession) return inProgressSession.number;

    // If no in-progress, find the lowest not-started session
    const notStartedSessions = sessions.filter(s => s.status === 'not-started');
    if (notStartedSessions.length > 0) {
      return Math.min(...notStartedSessions.map(s => s.number));
    }

    return 0;
  }, [sessions]);

  // Filter sessions to current and next rounds only
  const currentSessions = useMemo(
    () => sessions.filter(session => session.number === currentSessionNumber),
    [sessions, currentSessionNumber]
  );

  const nextSessions = useMemo(
    () => sessions.filter(session => session.number === currentSessionNumber + 1),
    [sessions, currentSessionNumber]
  );

  // Find active/loaded matches and their teams
  const activeMatch = useMemo(
    () => matches.find(m => m.id === field.activeMatch),
    [matches, field.activeMatch]
  );

  const loadedMatch = useMemo(
    () => matches.find(m => m.id === field.loadedMatch),
    [matches, field.loadedMatch]
  );

  const teamsOnField = useMemo(() => {
    const teamIds = new Set<string>();

    if (activeMatch) {
      activeMatch.participants.forEach(p => {
        if (p.team) teamIds.add(p.team.id);
      });
    }

    if (loadedMatch) {
      loadedMatch.participants.forEach(p => {
        if (p.team) teamIds.add(p.team.id);
      });
    }

    // Also include teams in called matches that haven't started
    matches
      .filter(m => m.called && m.status === 'not-started')
      .forEach(m => {
        m.participants.forEach(p => {
          if (p.team) teamIds.add(p.team.id);
        });
      });

    return teamIds;
  }, [activeMatch, loadedMatch, matches]);

  return (
    <>
      <PageHeader title={t('page-title')} />

      <Box sx={{ py: 3 }}>
        <ResponsiveComponent
          mobile={
            <JudgingStatusMobile
              currentSessions={currentSessions}
              nextSessions={nextSessions}
              rooms={rooms}
              sessionLength={sessionLength}
              teamsOnField={teamsOnField}
              loading={loading}
            />
          }
          desktop={
            <JudgingStatusTable
              currentSessions={currentSessions}
              nextSessions={nextSessions}
              rooms={rooms}
              sessionLength={sessionLength}
              teamsOnField={teamsOnField}
              loading={loading}
            />
          }
        />
      </Box>
    </>
  );
}
