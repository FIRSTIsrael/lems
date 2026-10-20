'use client';

import { useTranslations } from 'next-intl';
import { DataGrid, GridColDef, GridComparatorFn, GridSortDirection } from '@mui/x-data-grid';
import {
  Box,
  Grid,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Typography,
  alpha,
  useTheme
} from '@mui/material';
import { InsightsOverviewTeam } from '@lems/types/api/admin';
import { useJudgingCategoryTranslations } from '@lems/localization';
import { useOverviewInsights } from '../../lib/hooks';
import { formatDuration, formatNumber } from '../../lib/format';
import { WidgetProps } from './common';

const SummaryCard: React.FC<{ title: string; hint?: string; children: React.ReactNode }> = ({
  title,
  hint,
  children
}) => (
  <Paper sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', mb: 2, flexWrap: 'wrap' }}>
      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.05rem' }}>
        {title}
      </Typography>
      {hint && (
        <Typography variant="caption" color="text.secondary">
          {hint}
        </Typography>
      )}
    </Stack>
    <Stack spacing={1.5} sx={{ flex: 1 }}>
      {children}
    </Stack>
  </Paper>
);

interface MetricProps {
  label: string;
  value: string;
  detail?: string;
  loading?: boolean;
}

/** A compact tile: label (and optional detail) on one side, the value on the other. */
const Metric: React.FC<MetricProps> = ({ label, value, detail, loading }) => (
  <Box
    sx={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      px: 2,
      py: 1.5,
      borderRadius: 2,
      bgcolor: theme => alpha(theme.palette.primary.main, 0.05)
    }}
  >
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
      {detail && !loading && (
        <Typography variant="caption" color="text.secondary">
          {detail}
        </Typography>
      )}
    </Box>
    {loading ? (
      <Skeleton width={72} height={40} />
    ) : (
      <Typography sx={{ fontWeight: 800, fontSize: '1.75rem', lineHeight: 1.2 }}>
        {/* Isolate the value so numbers like "36 / 30" don't get reordered in RTL */}
        <Box component="span" dir="ltr">
          {value}
        </Box>
      </Typography>
    )}
  </Box>
);

interface ProgressRowProps {
  label: string;
  progress?: { completed: number; total: number };
}

const ProgressRow: React.FC<ProgressRowProps> = ({ label, progress }) => {
  const completed = progress?.completed ?? 0;
  const total = progress?.total ?? 0;
  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2" dir="ltr" sx={{ fontWeight: 700 }}>
          {`${completed} / ${total}`}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={total > 0 ? Math.min((completed / total) * 100, 100) : 0}
        sx={{ height: 8, borderRadius: 4 }}
      />
    </Box>
  );
};

export const OverviewStatsWidget: React.FC<WidgetProps> = ({ divisionId }) => {
  const t = useTranslations('pages.insights.widgets.overview-stats');
  const { data, isLoading } = useOverviewInsights(divisionId);

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6, lg: 5 }}>
        <SummaryCard title={t('progress')}>
          <Stack direction="row" spacing={2} sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', minWidth: 120 }}>
              <Metric
                label={t('teams')}
                value={formatNumber(data?.teamCount, 0)}
                loading={isLoading}
              />
            </Box>
            <Stack spacing={1.5} sx={{ flex: 1, justifyContent: 'space-between' }}>
              <ProgressRow label={t('matches')} progress={data?.matches} />
              <ProgressRow label={t('sessions')} progress={data?.sessions} />
              <ProgressRow label={t('scoresheets')} progress={data?.scoresheets} />
              <ProgressRow label={t('rubrics')} progress={data?.rubrics} />
            </Stack>
          </Stack>
        </SummaryCard>
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <SummaryCard title={t('scores')}>
          <Metric
            label={t('robot-game-average')}
            value={formatNumber(data?.robotGame.average)}
            detail={t('median', { value: formatNumber(data?.robotGame.median) })}
            loading={isLoading}
          />
          <Metric
            label={t('judging-average')}
            value={formatNumber(data?.judging.average, 2)}
            detail={t('median', { value: formatNumber(data?.judging.median, 2) })}
            loading={isLoading}
          />
        </SummaryCard>
      </Grid>
      <Grid size={{ xs: 12, lg: 3 }}>
        <SummaryCard title={t('delays')} hint={t('delay-hint')}>
          <Metric
            label={t('match-delay')}
            value={formatDuration(data?.averageMatchDelay)}
            loading={isLoading}
          />
          <Metric
            label={t('session-delay')}
            value={formatDuration(data?.averageSessionDelay)}
            loading={isLoading}
          />
        </SummaryCard>
      </Grid>
    </Grid>
  );
};

/**
 * Sorts numbers in the requested direction while always keeping empty values (teams with
 * no data) at the bottom, instead of the default behavior of putting them first on ascending.
 */
const nullsLastComparator = (direction: GridSortDirection): GridComparatorFn<number | null> => {
  const modifier = direction === 'desc' ? -1 : 1;
  return (a, b) => {
    if (a === null || a === undefined) return b === null || b === undefined ? 0 : 1;
    if (b === null || b === undefined) return -1;
    return (a - b) * modifier;
  };
};

export const TeamsTableWidget: React.FC<WidgetProps> = ({ divisionId }) => {
  const t = useTranslations('pages.insights.widgets.teams-table');
  const { getCategory } = useJudgingCategoryTranslations();
  const theme = useTheme();
  const { data, isLoading } = useOverviewInsights(divisionId);

  const numberColumn = (
    field: keyof InsightsOverviewTeam,
    headerName: string,
    digits = 2
  ): GridColDef<InsightsOverviewTeam> => ({
    field,
    headerName,
    type: 'number',
    width: 130,
    getSortComparator: nullsLastComparator,
    valueFormatter: (value: number | null) => formatNumber(value, digits)
  });

  const columns: GridColDef<InsightsOverviewTeam>[] = [
    {
      field: 'rank',
      headerName: t('rank'),
      type: 'number',
      width: 80,
      getSortComparator: nullsLastComparator
    },
    {
      field: 'number',
      headerName: t('number'),
      type: 'number',
      width: 90,
      valueFormatter: (value: number) => `#${value}`
    },
    { field: 'name', headerName: t('name'), flex: 1, minWidth: 160 },
    { field: 'affiliation', headerName: t('affiliation'), flex: 1, minWidth: 160 },
    numberColumn('maxScore', t('max-score'), 0),
    numberColumn('averageScore', t('average-score'), 1),
    numberColumn('innovation-project', getCategory('innovation-project')),
    numberColumn('robot-design', getCategory('robot-design')),
    numberColumn('core-values', getCategory('core-values')),
    numberColumn('judgingAverage', t('judging-average')),
    numberColumn('gpAverage', t('gp-average'))
  ];

  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.05rem', mb: 2 }}>
        {t('title')}
      </Typography>
      <DataGrid
        rows={data?.teams ?? []}
        getRowId={row => row.teamId}
        columns={columns}
        loading={isLoading}
        disableVirtualization={theme.direction === 'rtl'}
        initialState={{
          sorting: { sortModel: [{ field: 'rank', sort: 'asc' }] },
          pagination: { paginationModel: { page: 0, pageSize: 25 } }
        }}
        pageSizeOptions={[25, 50, 100]}
        disableRowSelectionOnClick
        sx={{ height: 600 }}
      />
    </Paper>
  );
};
