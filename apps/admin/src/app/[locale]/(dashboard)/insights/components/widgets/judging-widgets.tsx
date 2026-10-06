'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis
} from 'recharts';
import {
  Box,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography
} from '@mui/material';
import { orange, purple } from '@mui/material/colors';
import {
  INSIGHTS_JUDGING_CATEGORIES,
  InsightsJudgingCategory,
  InsightsRobotCorrelationPoint
} from '@lems/types/api/admin';
import {
  useAwardTranslations,
  useJudgingCategoryTranslations,
  useRubricsGeneralTranslations
} from '@lems/localization';
import { rubricColumns } from '@lems/shared/rubrics';
import { useJudgingInsights } from '../../lib/hooks';
import { formatDuration, formatNumber, round } from '../../lib/format';
import { ChartCard, StatCard } from '../cards';
import {
  CATEGORY_COLORS,
  CHART_COLORS,
  RUBRIC_LEVEL_COLORS,
  WidgetProps,
  tooltipStyle,
  useRubricFieldLabel
} from './common';

export const JudgingStatsWidget: React.FC<WidgetProps> = ({ divisionId }) => {
  const t = useTranslations('pages.insights.widgets.judging-stats');
  const { data, isLoading } = useJudgingInsights(divisionId);

  const cards = [
    {
      title: t('average'),
      value: formatNumber(data?.scores.average, 2),
      subtitle: t('median', { value: formatNumber(data?.scores.median, 2) })
    },
    {
      title: t('highest-average'),
      value: formatNumber(data?.highestTeamAverage?.value, 2),
      subtitle: data?.highestTeamAverage
        ? `#${data.highestTeamAverage.number} ${data.highestTeamAverage.name}`
        : undefined
    },
    {
      title: t('nominated-teams'),
      value: formatNumber(data?.nominations.teamsNominated, 0)
    },
    {
      title: t('session-delay'),
      value: formatDuration(data?.sessionDelay.average),
      subtitle: data?.sessionDelay.worst
        ? t('worst-room', {
            room: data.sessionDelay.worst.name,
            delay: formatDuration(data.sessionDelay.worst.average)
          })
        : undefined
    }
  ];

  return (
    <Grid container spacing={2}>
      {cards.map(card => (
        <Grid key={card.title} size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard {...card} color={orange[600]} loading={isLoading} />
        </Grid>
      ))}
    </Grid>
  );
};

export const CategoryScoresWidget: React.FC<WidgetProps> = ({ divisionId }) => {
  const t = useTranslations('pages.insights.widgets.category-scores');
  const { getCategory } = useJudgingCategoryTranslations();
  const { data, isLoading } = useJudgingInsights(divisionId);

  const chartData = (data?.categories ?? []).map(category => ({
    name: getCategory(category.category),
    average: round(category.average),
    median: round(category.median)
  }));

  return (
    <ChartCard
      title={t('title')}
      loading={isLoading}
      empty={chartData.every(c => c.average === null)}
    >
      <ResponsiveContainer>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 4]} />
          <Tooltip {...tooltipStyle} />
          <Legend />
          <Bar dataKey="average" name={t('average')} fill={CHART_COLORS.primary} />
          <Bar dataKey="median" name={t('median')} fill={CHART_COLORS.primaryLight} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export const RoomScoresWidget: React.FC<WidgetProps> = ({ divisionId }) => {
  const t = useTranslations('pages.insights.widgets.room-scores');
  const { getCategory } = useJudgingCategoryTranslations();
  const { data, isLoading } = useJudgingInsights(divisionId);

  const chartData = (data?.rooms ?? []).map(room => ({
    name: room.name,
    'innovation-project': round(room['innovation-project']),
    'robot-design': round(room['robot-design']),
    'core-values': round(room['core-values'])
  }));

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
          <YAxis domain={[0, 4]} />
          <Tooltip {...tooltipStyle} />
          <Legend />
          {INSIGHTS_JUDGING_CATEGORIES.map(category => (
            <Bar
              key={category}
              dataKey={category}
              name={getCategory(category)}
              fill={CATEGORY_COLORS[category]}
              radius={[4, 4, 0, 0]}
            />
          ))}
          {data?.scores.average != null && (
            <ReferenceLine y={data.scores.average} stroke={orange[600]} strokeDasharray="4 4" />
          )}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export const RoomDelaysWidget: React.FC<WidgetProps> = ({ divisionId }) => {
  const t = useTranslations('pages.insights.widgets.room-delays');
  const { data, isLoading } = useJudgingInsights(divisionId);

  const chartData = (data?.rooms ?? [])
    .filter(room => room.averageDelay !== null)
    .map(room => ({ name: room.name, delay: round((room.averageDelay as number) / 60) }));

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
          <YAxis unit={t('minutes-unit')} />
          <Tooltip {...tooltipStyle} formatter={value => formatDuration((value as number) * 60)} />
          <ReferenceLine y={0} stroke={CHART_COLORS.neutral} />
          <Bar dataKey="delay" name={t('delay')} fill={purple[300]} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

const correlationStrength = (r: number) => {
  const abs = Math.abs(r);
  if (abs < 0.3) return 'weak';
  if (abs < 0.7) return 'moderate';
  return 'strong';
};

export const RobotCorrelationWidget: React.FC<WidgetProps> = ({ divisionId, edition }) => {
  const t = useTranslations('pages.insights.widgets.robot-correlation');
  const { getCategory } = useJudgingCategoryTranslations();
  const { getName: getAwardName } = useAwardTranslations(edition);
  const robotDesign = getCategory('robot-design');
  const names = { design: robotDesign, game: getAwardName('robot-performance') };
  const { data, isLoading } = useJudgingInsights(divisionId);
  const points = data?.robotCorrelation.points ?? [];
  const regression = data?.robotCorrelation.regression ?? null;

  const lineData = regression
    ? [1, 4].map(x => ({ robotDesign: x, robotGame: regression.slope * x + regression.intercept }))
    : [];

  const byResidual = [...points]
    .filter(p => p.residual !== null)
    .sort((a, b) => (b.residual as number) - (a.residual as number));
  const overPerformers = byResidual.slice(0, 3);
  const underPerformers = byResidual.slice(-3).reverse();

  const renderTeams = (title: string, teams: InsightsRobotCorrelationPoint[], color: string) => (
    <Box>
      <Typography variant="subtitle2" sx={{ color }}>
        {title}
      </Typography>
      <List dense disablePadding>
        {teams.map(team => (
          <ListItem key={team.teamId} disableGutters>
            <ListItemText
              primary={`#${team.number} ${team.name}`}
              secondary={t('team-detail', {
                design: formatNumber(team.robotDesign, 2),
                score: team.robotGame,
                residual: formatNumber(team.residual, 0)
              })}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <ChartCard
      title={t('title', names)}
      description={t('description', names)}
      loading={isLoading}
      empty={points.length === 0}
      height={420}
      action={
        regression && (
          <Stack direction="row" spacing={1}>
            <Chip
              size="small"
              label={`r = ${formatNumber(regression.r, 2)} (${t(`strength.${correlationStrength(regression.r)}`)})`}
            />
            <Chip size="small" label={`R² = ${formatNumber(regression.r2, 2)}`} />
            <Chip size="small" label={`n = ${regression.n}`} />
          </Stack>
        )
      }
    >
      <Grid container spacing={2} sx={{ height: '100%' }}>
        <Grid size={{ xs: 12, lg: 8 }} sx={{ height: '100%' }}>
          <ResponsiveContainer>
            <ScatterChart margin={{ bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="robotDesign"
                name={robotDesign}
                domain={[1, 4]}
                ticks={[1, 1.5, 2, 2.5, 3, 3.5, 4]}
                label={{ value: robotDesign, position: 'insideBottom', offset: -10 }}
              />
              <YAxis
                type="number"
                dataKey="robotGame"
                name={t('robot-game')}
                label={{ value: t('robot-game'), angle: -90, position: 'insideLeft' }}
              />
              <ZAxis range={[60, 60]} />
              <Tooltip
                {...tooltipStyle}
                content={({ active, payload }) => {
                  const point = payload?.[0]?.payload as InsightsRobotCorrelationPoint | undefined;
                  if (!active || !point?.teamId) return null;
                  return (
                    <Paper sx={{ p: 1.5 }}>
                      <Typography variant="subtitle2">{`#${point.number} ${point.name}`}</Typography>
                      <Typography variant="body2">
                        {t('team-detail', {
                          design: formatNumber(point.robotDesign, 2),
                          score: point.robotGame,
                          residual: formatNumber(point.residual, 0)
                        })}
                      </Typography>
                    </Paper>
                  );
                }}
              />
              <Scatter data={points} fill={CHART_COLORS.negative} />
              {regression && (
                <Scatter
                  data={lineData}
                  line={{ stroke: CHART_COLORS.primary, strokeWidth: 2 }}
                  shape={() => <g />}
                  legendType="none"
                  isAnimationActive={false}
                />
              )}
            </ScatterChart>
          </ResponsiveContainer>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }} sx={{ direction: 'initial', overflow: 'auto' }}>
          {regression && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {t('equation', {
                slope: formatNumber(regression.slope, 1),
                intercept: formatNumber(regression.intercept, 1)
              })}
            </Typography>
          )}
          {renderTeams(t('over-performers'), overPerformers, CHART_COLORS.positive)}
          {renderTeams(t('under-performers'), underPerformers, CHART_COLORS.negative)}
        </Grid>
      </Grid>
    </ChartCard>
  );
};

export const FieldDistributionWidget: React.FC<WidgetProps> = ({ divisionId, edition }) => {
  const t = useTranslations('pages.insights.widgets.field-distribution');
  const { getCategory } = useJudgingCategoryTranslations();
  const { getColumnTitle } = useRubricsGeneralTranslations();
  const getFieldLabel = useRubricFieldLabel(edition);
  const [category, setCategory] = useState<InsightsJudgingCategory>('innovation-project');
  const { data, isLoading } = useJudgingInsights(divisionId);

  const chartData = (data?.fieldDistributions ?? [])
    .filter(field => field.category === category)
    .map(field => ({
      name: getFieldLabel(category, field.fieldId),
      average: round(field.average),
      ...Object.fromEntries(field.counts.map((count, index) => [`level${index + 1}`, count]))
    }));

  return (
    <ChartCard
      title={t('title')}
      description={t('description')}
      loading={isLoading}
      empty={chartData.length === 0}
      height={380}
      action={
        <Select
          size="small"
          value={category}
          onChange={event => setCategory(event.target.value as InsightsJudgingCategory)}
        >
          {INSIGHTS_JUDGING_CATEGORIES.map(c => (
            <MenuItem key={c} value={c}>
              {getCategory(c)}
            </MenuItem>
          ))}
        </Select>
      }
    >
      <ResponsiveContainer>
        <BarChart data={chartData} layout="vertical" margin={{ left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" allowDecimals={false} />
          <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 12 }} />
          <Tooltip {...tooltipStyle} />
          <Legend />
          {[1, 2, 3, 4].map(level => (
            <Bar
              key={level}
              dataKey={`level${level}`}
              stackId="levels"
              name={getColumnTitle(rubricColumns[level - 1])}
              fill={RUBRIC_LEVEL_COLORS[level - 1]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export const AwardNominationsWidget: React.FC<WidgetProps> = ({ divisionId, edition }) => {
  const t = useTranslations('pages.insights.widgets.award-nominations');
  const { getName } = useAwardTranslations(edition);
  const { data, isLoading } = useJudgingInsights(divisionId);

  const chartData = (data?.nominations.awards ?? []).map(award => ({
    name: getName(award.award),
    count: award.count
  }));

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
          <YAxis allowDecimals={false} />
          <Tooltip {...tooltipStyle} />
          <Bar dataKey="count" name={t('count')} fill={CHART_COLORS.accent} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
