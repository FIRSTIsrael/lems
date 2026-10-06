'use client';

import { useTranslations } from 'next-intl';
import { DataGrid, GridColDef, GridComparatorFn, GridSortDirection } from '@mui/x-data-grid';
import { Grid, Paper, Typography, useTheme } from '@mui/material';
import { blue, green, orange, purple } from '@mui/material/colors';
import { InsightsOverviewTeam } from '@lems/types/api/admin';
import { useJudgingCategoryTranslations } from '@lems/localization';
import { useOverviewInsights } from '../../lib/hooks';
import { formatDuration, formatNumber } from '../../lib/format';
import { StatCard } from '../cards';
import { WidgetProps } from './common';

export const OverviewStatsWidget: React.FC<WidgetProps> = ({ divisionId }) => {
  const t = useTranslations('pages.insights.widgets.overview-stats');
  const { data, isLoading } = useOverviewInsights(divisionId);

  const cards = [
    { title: t('teams'), value: formatNumber(data?.teamCount, 0), color: blue[500] },
    {
      title: t('matches'),
      value: `${data?.matches.completed ?? 0} / ${data?.matches.total ?? 0}`,
      color: green[600]
    },
    {
      title: t('sessions'),
      value: `${data?.sessions.completed ?? 0} / ${data?.sessions.total ?? 0}`,
      color: orange[600]
    },
    {
      title: t('scoresheets'),
      value: `${data?.scoresheets.completed ?? 0} / ${data?.scoresheets.total ?? 0}`,
      color: green[600]
    },
    {
      title: t('rubrics'),
      value: `${data?.rubrics.completed ?? 0} / ${data?.rubrics.total ?? 0}`,
      color: orange[600]
    },
    {
      title: t('robot-game-average'),
      value: formatNumber(data?.robotGame.average),
      subtitle: t('median', { value: formatNumber(data?.robotGame.median) }),
      color: green[600]
    },
    {
      title: t('judging-average'),
      value: formatNumber(data?.judging.average, 2),
      subtitle: t('median', { value: formatNumber(data?.judging.median, 2) }),
      color: orange[600]
    },
    {
      title: t('match-delay'),
      value: formatDuration(data?.averageMatchDelay),
      subtitle: t('delay-hint'),
      color: purple[400]
    },
    {
      title: t('session-delay'),
      value: formatDuration(data?.averageSessionDelay),
      subtitle: t('delay-hint'),
      color: purple[400]
    }
  ];

  return (
    <Grid container spacing={2}>
      {cards.map(card => (
        <Grid key={card.title} size={{ xs: 12, sm: 6, md: 4, xl: 'grow' }}>
          <StatCard {...card} loading={isLoading} />
        </Grid>
      ))}
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
