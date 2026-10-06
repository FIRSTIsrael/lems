'use client';

import { useTranslations } from 'next-intl';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis
} from 'recharts';
import { Chip, Grid, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { green, orange, purple } from '@mui/material/colors';
import { useRobotGameInsights } from '../../lib/hooks';
import { formatDuration, formatNumber, formatPercent, round } from '../../lib/format';
import { ChartCard, StatCard } from '../cards';
import {
  CHART_COLORS,
  WidgetProps,
  tooltipStyle,
  useMissionLabel,
  useMissionTitle,
  useStageLabel
} from './common';

const INSPECTION_MISSION_ID = 'eib';
const PRECISION_TOKENS_MISSION_ID = 'pt';

export const RobotGameStatsWidget: React.FC<WidgetProps> = ({ divisionId, stage }) => {
  const t = useTranslations('pages.insights.widgets.robot-game-stats');
  const { data, isLoading } = useRobotGameInsights(divisionId, stage);

  const cards = [
    {
      title: t('average'),
      value: formatNumber(data?.scores.average),
      subtitle: t('median', { value: formatNumber(data?.scores.median) })
    },
    {
      title: t('top-scores'),
      value: formatNumber(data?.topScores.average),
      subtitle: t('median', { value: formatNumber(data?.topScores.median) })
    },
    {
      title: t('highest-score'),
      value: formatNumber(data?.highestScore?.score, 0),
      subtitle: data?.highestScore
        ? `#${data.highestScore.number} ${data.highestScore.name}`
        : undefined
    },
    {
      title: t('std-dev'),
      value: formatNumber(data?.scores.stdDev),
      subtitle: t('score-count', { count: data?.scores.count ?? 0 })
    }
  ];

  return (
    <Grid container spacing={2}>
      {cards.map(card => (
        <Grid key={card.title} size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard {...card} color={green[600]} loading={isLoading} />
        </Grid>
      ))}
    </Grid>
  );
};

export const ScoresByRoundWidget: React.FC<WidgetProps> = ({ divisionId, stage }) => {
  const t = useTranslations('pages.insights.widgets.scores-by-round');
  const getStage = useStageLabel();
  const { data, isLoading } = useRobotGameInsights(divisionId, stage);

  const chartData = (data?.scoresByRound ?? []).map(row => ({
    name: `${getStage(row.stage)} ${row.round}`,
    average: round(row.average, 1),
    median: round(row.median, 1),
    max: row.max
  }));

  return (
    <ChartCard title={t('title')} loading={isLoading} empty={chartData.length === 0}>
      <ResponsiveContainer>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip {...tooltipStyle} />
          <Legend />
          <Bar dataKey="average" name={t('average')} fill={CHART_COLORS.primaryLight} />
          <Bar dataKey="median" name={t('median')} fill={CHART_COLORS.primary} />
          <Line dataKey="max" name={t('max')} stroke={CHART_COLORS.secondary} strokeWidth={2} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export const ScoresPerTableWidget: React.FC<WidgetProps> = ({ divisionId, stage }) => {
  const t = useTranslations('pages.insights.widgets.scores-per-table');
  const { data, isLoading } = useRobotGameInsights(divisionId, stage);

  const chartData = (data?.tables ?? [])
    .filter(table => table.count > 0)
    .map(table => ({
      name: table.name,
      average: round(table.average, 1),
      median: round(table.median, 1),
      count: table.count
    }));
  const overall = data?.scores.average ?? null;

  return (
    <ChartCard
      title={t('title')}
      description={t('description')}
      loading={isLoading}
      empty={chartData.length === 0}
    >
      <ResponsiveContainer>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip {...tooltipStyle} />
          <Legend />
          <Bar dataKey="average" name={t('average')} fill={CHART_COLORS.primary} />
          <Bar dataKey="median" name={t('median')} fill={CHART_COLORS.primaryLight} />
          {overall !== null && (
            <ReferenceLine
              y={overall}
              stroke={CHART_COLORS.secondary}
              strokeDasharray="4 4"
              label={{ value: t('overall'), position: 'insideTopRight' }}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export const MissionSuccessWidget: React.FC<WidgetProps> = ({ divisionId, stage }) => {
  const t = useTranslations('pages.insights.widgets.mission-success');
  const getMission = useMissionLabel();
  const { data, isLoading } = useRobotGameInsights(divisionId, stage);

  const chartData = (data?.missions ?? []).map(mission => ({
    id: mission.missionId.toUpperCase(),
    label: getMission(mission.missionId),
    successRate: round(mission.successRate, 1),
    averagePoints: round(mission.averagePoints, 1)
  }));

  return (
    <ChartCard
      title={t('title')}
      description={t('description')}
      loading={isLoading}
      empty={chartData.every(m => m.successRate === null)}
    >
      <ResponsiveContainer>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="id" />
          <YAxis domain={[0, 100]} unit="%" />
          <Tooltip
            {...tooltipStyle}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.label ?? ''}
            formatter={(value, name) =>
              name === t('success-rate') ? `${value}%` : (value as number)
            }
          />
          <Bar
            dataKey="successRate"
            name={t('success-rate')}
            fill={CHART_COLORS.positive}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export const InspectionWidget: React.FC<WidgetProps> = ({ divisionId, stage }) => {
  const t = useTranslations('pages.insights.widgets.inspection');
  const getMissionTitle = useMissionTitle();
  const { data, isLoading } = useRobotGameInsights(divisionId, stage);
  const inspection = data?.inspection;

  return (
    <ChartCard
      title={getMissionTitle(INSPECTION_MISSION_ID)}
      description={t('description')}
      loading={isLoading}
      empty={!inspection || inspection.teamCount === 0}
      ltr={false}
      height="auto"
    >
      {inspection && (
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
              {t('success-rate')}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={inspection.successRate ?? 0}
              color="success"
              sx={{ height: 10, borderRadius: 5, flex: 1 }}
            />
            <Typography sx={{ fontWeight: 700, flexShrink: 0 }}>
              {formatPercent(inspection.successRate)}
            </Typography>
          </Stack>
          <Typography variant="subtitle2">
            {t('failures', { count: inspection.failures.length })}
          </Typography>
          {inspection.failures.length > 0 && (
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {inspection.failures.map(team => (
                <Chip
                  key={team.teamId}
                  size="small"
                  color="error"
                  variant="outlined"
                  label={`#${team.number} ${team.name} · ${t('times', { count: team.count })}`}
                />
              ))}
            </Stack>
          )}
        </Stack>
      )}
    </ChartCard>
  );
};

export const PrecisionTokensWidget: React.FC<WidgetProps> = ({ divisionId, stage }) => {
  const t = useTranslations('pages.insights.widgets.precision-tokens');
  const getMissionTitle = useMissionTitle();
  const { data, isLoading } = useRobotGameInsights(divisionId, stage);

  const chartData = (data?.precisionTokens ?? []).map(row => ({
    tokens: row.tokens,
    count: row.count,
    averageScore: round(row.averageScore, 1)
  }));

  return (
    <ChartCard
      title={getMissionTitle(PRECISION_TOKENS_MISSION_ID)}
      description={t('description')}
      loading={isLoading}
      empty={chartData.length === 0}
    >
      <ResponsiveContainer>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="tokens" />
          <YAxis yAxisId="count" allowDecimals={false} />
          <YAxis yAxisId="score" orientation="right" />
          <Tooltip
            {...tooltipStyle}
            labelFormatter={value => t('tokens', { count: Number(value) })}
          />
          <Legend />
          <Bar yAxisId="count" dataKey="count" name={t('count')} fill={CHART_COLORS.primary} />
          <Line
            yAxisId="score"
            dataKey="averageScore"
            name={t('average-score')}
            stroke={CHART_COLORS.secondary}
            strokeWidth={2}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export const CycleTimesWidget: React.FC<WidgetProps> = ({ divisionId, stage }) => {
  const t = useTranslations('pages.insights.widgets.cycle-times');
  const getStage = useStageLabel();
  const { data, isLoading } = useRobotGameInsights(divisionId, stage);

  return (
    <ChartCard
      title={t('title')}
      description={t('description')}
      loading={isLoading}
      empty={!data?.cycleTimes.some(c => c.count > 0)}
      ltr={false}
      height="auto"
    >
      <Stack spacing={1.5}>
        {data?.cycleTimes.map(cycle => (
          <Grid key={cycle.stage} container spacing={1} sx={{ alignItems: 'center' }}>
            <Grid size={12}>
              <Typography sx={{ fontWeight: 600 }}>{getStage(cycle.stage)}</Typography>
            </Grid>
            {(
              [
                ['average', cycle.average],
                ['median', cycle.median],
                ['min', cycle.min],
                ['max', cycle.max],
                ['percentile95', cycle.percentile95],
                ['average-delay', cycle.averageDelay]
              ] as const
            ).map(([key, value]) => (
              <Grid key={key} size={4}>
                <Typography variant="caption" color="text.secondary">
                  {t(key)}
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>{formatDuration(value)}</Typography>
              </Grid>
            ))}
          </Grid>
        ))}
      </Stack>
    </ChartCard>
  );
};

export const MatchDelaysWidget: React.FC<WidgetProps> = ({ divisionId, stage }) => {
  const t = useTranslations('pages.insights.widgets.match-delays');
  const getStage = useStageLabel();
  const { data, isLoading } = useRobotGameInsights(divisionId, stage);

  const chartData = (data?.matchDelays ?? []).map(match => ({
    name: `${getStage(match.stage)} #${match.number}`,
    delay: round(match.delay / 60, 2)
  }));

  return (
    <ChartCard
      title={t('title')}
      description={t('description')}
      loading={isLoading}
      empty={chartData.length === 0}
    >
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={false} />
          <YAxis unit={t('minutes-unit')} />
          <Tooltip {...tooltipStyle} formatter={value => formatDuration((value as number) * 60)} />
          <ReferenceLine y={0} stroke={CHART_COLORS.neutral} />
          <Line
            dataKey="delay"
            name={t('delay')}
            stroke={purple[400]}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export const RobotConsistencyWidget: React.FC<WidgetProps> = ({ divisionId, stage }) => {
  const t = useTranslations('pages.insights.widgets.robot-consistency');
  const { data, isLoading } = useRobotGameInsights(divisionId, stage);

  const points = (data?.consistency.rows ?? [])
    .filter(row => row.relStdDev !== null && row.scores.length > 1)
    .map(row => ({
      ...row,
      average: round(row.average, 1),
      relStdDev: round(row.relStdDev, 1)
    }));
  const average = data?.consistency.averageRelStdDev ?? null;

  return (
    <ChartCard
      title={t('title')}
      description={t('description')}
      loading={isLoading}
      empty={points.length === 0}
      action={
        <Typography variant="body2" color="text.secondary">
          {t('average-rel-std-dev', { value: formatPercent(average) })}
        </Typography>
      }
    >
      <ResponsiveContainer>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" dataKey="average" name={t('average-score')} />
          <YAxis type="number" dataKey="relStdDev" name={t('rel-std-dev')} unit="%" />
          <ZAxis range={[60, 60]} />
          {average !== null && (
            <ReferenceLine y={average} stroke={orange[600]} strokeDasharray="4 4" />
          )}
          <Tooltip
            {...tooltipStyle}
            content={({ active, payload }) => {
              const row = payload?.[0]?.payload as (typeof points)[number] | undefined;
              if (!active || !row) return null;
              return (
                <Paper sx={{ p: 1.5 }}>
                  <Typography variant="subtitle2">{`#${row.number} ${row.name}`}</Typography>
                  <Typography variant="body2">
                    {t('scores', { scores: row.scores.join(', ') })}
                  </Typography>
                  <Typography variant="body2">
                    {`${t('average-score')}: ${formatNumber(row.average)}`}
                  </Typography>
                  <Typography variant="body2">
                    {`${t('rel-std-dev')}: ${formatPercent(row.relStdDev)}`}
                  </Typography>
                </Paper>
              );
            }}
          />
          <Scatter data={points} fill={CHART_COLORS.primary} />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
