'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  Stack,
  Alert,
  Typography,
  Paper,
  Button,
  Popover,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Badge
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import dayjs from 'dayjs';
import { useEvent } from '../../components/event-context';
import { PageHeader } from '../components/page-header';
import { useTime } from '../../../../../../lib/time/hooks/use-time';
import { usePageData } from '../../hooks/use-page-data';
import {
  GET_JUDGING_QUEUER_DATA,
  parseJudgingQueuerData,
  type JudgingQueuerData,
  type QueryData,
  type QueryVars
} from './graphql/index';
import { createSessionStatusUpdatedSubscription } from './graphql/subscriptions';
import {
  TeamQueueCard,
  JudgingQueuerBottomNav,
  JudgingScheduleView,
  PitMapView
} from './components';

export default function JudgingQueuerPage() {
  const t = useTranslations('pages.judging-queuer');
  const { currentDivision } = useEvent();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentTime = useTime({ interval: 1000 });
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const activeTab = searchParams.get('tab') || 'home';

  const handleTabChange = (newTab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newTab === 'home') {
      params.delete('tab');
    } else {
      params.set('tab', newTab);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const selectedRooms = useMemo(
    () => searchParams.get('rooms')?.split(',').filter(Boolean) || [],
    [searchParams]
  );

  const subscriptions = useMemo(
    () => [createSessionStatusUpdatedSubscription(currentDivision.id)],
    [currentDivision.id]
  );

  const { data, loading, error } = usePageData<
    QueryData,
    QueryVars,
    JudgingQueuerData,
    { divisionId: string }
  >(
    GET_JUDGING_QUEUER_DATA,
    { divisionId: currentDivision.id },
    parseJudgingQueuerData,
    subscriptions
  );

  const safeData = data ?? {
    sessions: [],
    matches: [],
    rooms: []
  };

  const rooms = useMemo(() => {
    const roomSet = new Set<string>();
    safeData.sessions.forEach(session => {
      if (session.room) roomSet.add(session.room.name);
    });
    return Array.from(roomSet).sort();
  }, [safeData.sessions]);

  const calledTeams = useMemo(() => {
    const teams: Array<{
      teamNumber: number;
      teamName: string;
      roomName: string;
      sessionNumber: number;
      scheduledTime: string;
      isInMatch: boolean;
      isUrgent: boolean;
      isQueued: boolean;
      teamId: string;
      roomId: string;
    }> = [];

    const calledSessions = safeData.sessions.filter(s => s.called && s.status === 'not-started');

    const activeMatches = safeData.matches.filter(
      m => m.status === 'in-progress' || (m.status === 'not-started' && m.called)
    );

    calledSessions.forEach(session => {
      if (!session.team || !session.room || !session.team.arrived || session.queued) return;

      const isInMatch = activeMatches.some(m => {
        // Check if team is in an active match - this would need participant data
        // For now, we'll use a simple check
        return m.status === 'in-progress';
      });

      const minutesUntilSession = currentTime.diff(dayjs(session.scheduledTime), 'minute');
      const isUrgent = minutesUntilSession >= -10;

      teams.push({
        teamNumber: session.team.number,
        teamName: session.team.name,
        roomName: session.room.name,
        sessionNumber: session.number,
        scheduledTime: session.scheduledTime,
        isInMatch,
        isUrgent,
        isQueued: session.queued,
        teamId: session.team.id,
        roomId: session.room.id
      });
    });

    teams.sort((a, b) => {
      if (a.isUrgent !== b.isUrgent) return a.isUrgent ? -1 : 1;
      if (a.isInMatch !== b.isInMatch) return a.isInMatch ? 1 : -1;
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });

    return teams;
  }, [safeData.sessions, safeData.matches, currentTime]);

  const filteredTeams = useMemo(() => {
    if (selectedRooms.length === 0) return calledTeams;
    return calledTeams.filter(team => selectedRooms.includes(team.roomName));
  }, [calledTeams, selectedRooms]);

  const handleToggle = (room: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get('rooms')?.split(',').filter(Boolean) || [];
    const updated = current.includes(room) ? current.filter(r => r !== room) : [...current, room];

    if (updated.length > 0) {
      params.set('rooms', updated.join(','));
    } else {
      params.delete('rooms');
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      {activeTab === 'home' && (
        <PageHeader title={t('page-title')}>
          <Badge badgeContent={selectedRooms.length} color="primary">
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={e => setAnchorEl(e.currentTarget)}
              size="small"
            >
              {t('filter-by-room')}
            </Button>
          </Badge>
        </PageHeader>
      )}

      {activeTab === 'home' && (
        <>
          <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Paper sx={{ p: 2, minWidth: 200 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                {t('filter-by-room')}
              </Typography>
              <FormGroup>
                {rooms.map(room => (
                  <FormControlLabel
                    key={room}
                    control={
                      <Checkbox
                        checked={selectedRooms.includes(room)}
                        onChange={() => handleToggle(room)}
                        size="small"
                      />
                    }
                    label={room}
                  />
                ))}
              </FormGroup>
            </Paper>
          </Popover>

          <Stack spacing={3} sx={{ pt: 3, pb: 10 }}>
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
                roomName={team.roomName}
                sessionNumber={team.sessionNumber}
                scheduledTime={team.scheduledTime}
                isInMatch={team.isInMatch}
                isUrgent={team.isUrgent}
              />
            ))}
          </Stack>
        </>
      )}

      {activeTab === 'schedule' && (
        <Stack sx={{ pt: 3, pb: 10 }}>
          <JudgingScheduleView data={safeData} loading={loading} />
        </Stack>
      )}

      {activeTab === 'pit-map' && (
        <Stack sx={{ pt: 3, pb: 10 }}>
          <PitMapView />
        </Stack>
      )}

      <JudgingQueuerBottomNav value={activeTab} onChange={handleTabChange} />
    </>
  );
}
