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
  createParticipantStatusUpdatedSubscription
} from './graphql/subscriptions';
import {
  TeamQueueCard,
  FieldQueuerBottomNav,
  FieldScheduleView,
  PitMapView,
  FieldQueuerProvider,
  useFieldQueuer
} from './components';

function FieldQueuerContent() {
  const t = useTranslations('pages.field-queuer');
  const { tables, calledTeams, data, loading } = useFieldQueuer();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
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

  const selectedTables = useMemo(
    () => searchParams.get('tables')?.split(',').filter(Boolean) || [],
    [searchParams]
  );

  const filteredTeams = useMemo(() => {
    if (selectedTables.length === 0) return calledTeams;
    return calledTeams.filter(team => selectedTables.includes(team.tableName));
  }, [calledTeams, selectedTables]);

  const handleToggle = (table: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get('tables')?.split(',').filter(Boolean) || [];
    const updated = current.includes(table)
      ? current.filter(t => t !== table)
      : [...current, table];

    if (updated.length > 0) {
      params.set('tables', updated.join(','));
    } else {
      params.delete('tables');
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      {activeTab === 'home' && (
        <PageHeader title={t('page-title')}>
          <Badge badgeContent={selectedTables.length} color="primary">
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={e => setAnchorEl(e.currentTarget)}
              size="small"
            >
              {t('filter-by-table')}
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
                {t('filter-by-table')}
              </Typography>
              <FormGroup>
                {tables.map(table => (
                  <FormControlLabel
                    key={table}
                    control={
                      <Checkbox
                        checked={selectedTables.includes(table)}
                        onChange={() => handleToggle(table)}
                        size="small"
                      />
                    }
                    label={table}
                  />
                ))}
              </FormGroup>
            </Paper>
          </Popover>

          <Stack spacing={3} sx={{ pt: 3, pb: 10 }}>
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
        </>
      )}

      {activeTab === 'schedule' && (
        <Stack sx={{ pt: 3, pb: 10 }}>
          <FieldScheduleView data={data} loading={loading} />
        </Stack>
      )}

      {activeTab === 'pit-map' && (
        <Stack sx={{ pt: 3, pb: 10 }}>
          <PitMapView />
        </Stack>
      )}

      <FieldQueuerBottomNav value={activeTab} onChange={handleTabChange} />
    </>
  );
}

export default function FieldQueuerPage() {
  const { currentDivision } = useEvent();
  const currentTime = useTime({ interval: 1000 });

  const subscriptions = useMemo(
    () => [
      createMatchCallUpdatedSubscription(currentDivision.id),
      createParticipantStatusUpdatedSubscription(currentDivision.id)
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

  if (error) {
    return (
      <Stack spacing={3} sx={{ pt: 3 }}>
        <Alert severity="error">{error.message}</Alert>
      </Stack>
    );
  }

  return (
    <FieldQueuerProvider
      divisionId={currentDivision.id}
      data={safeData}
      loading={loading}
      currentTime={currentTime}
    >
      <FieldQueuerContent />
    </FieldQueuerProvider>
  );
}
