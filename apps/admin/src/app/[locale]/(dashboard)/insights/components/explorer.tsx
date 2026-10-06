'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  Button,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { BarChartOutlined, Download, TableRowsOutlined } from '@mui/icons-material';
import { getScoresheet } from '@lems/shared/scoresheet';
import { getRubrics, getCvFieldIds } from '@lems/shared/rubrics';
import {
  INSIGHTS_EXPLORER_AGGREGATIONS,
  INSIGHTS_EXPLORER_METRICS,
  INSIGHTS_JUDGING_CATEGORIES,
  INSIGHTS_METRIC_DIMENSIONS,
  INSIGHTS_STAGES,
  InsightsExplorerAggregation,
  InsightsExplorerDimension,
  InsightsExplorerMetric,
  InsightsExplorerQuery,
  InsightsJudgingCategory,
  InsightsStage
} from '@lems/types/api/admin';
import { useJudgingCategoryTranslations } from '@lems/localization';
import { useExplorerInsights } from '../lib/hooks';
import { formatDuration, formatNumber, round } from '../lib/format';
import { ChartCard } from './cards';
import {
  CHART_COLORS,
  WidgetProps,
  tooltipStyle,
  useMissionLabel,
  useRubricFieldLabel,
  useStageLabel
} from './widgets/common';

const STAGE_METRICS: InsightsExplorerMetric[] = [
  'robot-game-score',
  'mission-points',
  'gp-score',
  'match-delay'
];
const DELAY_METRICS: InsightsExplorerMetric[] = ['match-delay', 'session-delay'];
const ALL = 'all';

interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  options: readonly T[];
  getLabel: (option: T) => string;
  onChange: (value: T) => void;
}

function SelectField<T extends string>({
  label,
  value,
  options,
  getLabel,
  onChange
}: SelectFieldProps<T>) {
  return (
    <FormControl fullWidth size="small">
      <InputLabel>{label}</InputLabel>
      <Select label={label} value={value} onChange={event => onChange(event.target.value as T)}>
        {options.map(option => (
          <MenuItem key={option} value={option}>
            {getLabel(option)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export const Explorer: React.FC<WidgetProps> = ({ divisionId, edition }) => {
  const t = useTranslations('pages.insights.explorer');
  const { getCategory } = useJudgingCategoryTranslations();
  const getStage = useStageLabel();
  const getMission = useMissionLabel();
  const getFieldLabel = useRubricFieldLabel(edition);

  const missions = useMemo(() => getScoresheet(edition).missions.map(m => m.id), [edition]);

  const [metric, setMetric] = useState<InsightsExplorerMetric>('robot-game-score');
  const [groupBy, setGroupBy] = useState<InsightsExplorerDimension>('team');
  const [aggregation, setAggregation] = useState<InsightsExplorerAggregation>('average');
  const [stage, setStage] = useState<InsightsStage | typeof ALL>('RANKING');
  const [category, setCategory] = useState<InsightsJudgingCategory | typeof ALL>(ALL);
  const [field, setField] = useState<string>(ALL);
  const [mission, setMission] = useState<string>(missions[0]);
  const [view, setView] = useState<'chart' | 'table'>('chart');

  const fields = useMemo(() => {
    if (category === ALL) return [];
    if (category === 'core-values') {
      const cv = getCvFieldIds(edition);
      return [
        ...cv['innovation-project'].map(id => `ip-${id}`),
        ...cv['robot-design'].map(id => `rd-${id}`)
      ];
    }
    return getRubrics(edition)[category].sections.flatMap(s => s.fields.map(f => f.id));
  }, [category, edition]);

  const dimensions = INSIGHTS_METRIC_DIMENSIONS[metric];
  const effectiveGroupBy = dimensions.includes(groupBy) ? groupBy : dimensions[0];

  const query: InsightsExplorerQuery = {
    metric,
    groupBy: effectiveGroupBy,
    aggregation,
    stage: STAGE_METRICS.includes(metric) && stage !== ALL ? stage : undefined,
    category: metric === 'rubric-score' && category !== ALL ? category : undefined,
    field: metric === 'rubric-score' && category !== ALL && field !== ALL ? field : undefined,
    mission: metric === 'mission-points' ? mission : undefined
  };

  const { data, isLoading, error } = useExplorerInsights(divisionId, query);

  const isDuration = DELAY_METRICS.includes(metric) && aggregation !== 'count';
  const formatValue = (value: number | null) =>
    isDuration ? formatDuration(value) : formatNumber(value, 2);

  const getRowLabel = (label: string) => {
    switch (data?.dimension) {
      case 'none':
        return t('all');
      case 'stage':
        return getStage(label);
      case 'category':
        return getCategory(label);
      case 'round': {
        const [rowStage, rowRound] = label.split(':');
        return `${getStage(rowStage)} ${rowRound}`;
      }
      default:
        return label;
    }
  };

  const rows = (data?.rows ?? []).map(row => ({ ...row, label: getRowLabel(row.label) }));
  const chartData = rows.map(row => ({
    name: row.label,
    value: isDuration && row.value !== null ? round(row.value / 60) : round(row.value)
  }));

  const downloadCsv = () => {
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const lines = [
      [t('columns.group'), t('columns.value'), t('columns.count')].map(escape).join(','),
      ...rows.map(row => [escape(row.label), row.value ?? '', row.count].join(','))
    ];
    const blob = new Blob([`\uFEFF${lines.join('\n')}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `insights-${metric}-${effectiveGroupBy}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Stack spacing={2}>
      <Paper sx={{ p: 2.5 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <SelectField
              label={t('metric')}
              value={metric}
              options={INSIGHTS_EXPLORER_METRICS}
              getLabel={m => t(`metrics.${m}`)}
              onChange={setMetric}
            />
          </Grid>
          {metric === 'mission-points' && (
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SelectField
                label={t('mission')}
                value={mission}
                options={missions}
                getLabel={getMission}
                onChange={setMission}
              />
            </Grid>
          )}
          {metric === 'rubric-score' && (
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SelectField
                label={t('category')}
                value={category}
                options={[ALL, ...INSIGHTS_JUDGING_CATEGORIES] as const}
                getLabel={c => (c === ALL ? t('all') : getCategory(c))}
                onChange={value => {
                  setCategory(value);
                  setField(ALL);
                }}
              />
            </Grid>
          )}
          {metric === 'rubric-score' && category !== ALL && (
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SelectField
                label={t('field')}
                value={field}
                options={[ALL, ...fields]}
                getLabel={f => (f === ALL ? t('all-fields') : getFieldLabel(category, f))}
                onChange={setField}
              />
            </Grid>
          )}
          {STAGE_METRICS.includes(metric) && (
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SelectField
                label={t('stage')}
                value={stage}
                options={[ALL, ...INSIGHTS_STAGES] as const}
                getLabel={s => (s === ALL ? t('all') : getStage(s))}
                onChange={setStage}
              />
            </Grid>
          )}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <SelectField
              label={t('group-by')}
              value={effectiveGroupBy}
              options={dimensions}
              getLabel={d => t(`dimensions.${d}`)}
              onChange={setGroupBy}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <SelectField
              label={t('aggregation')}
              value={aggregation}
              options={INSIGHTS_EXPLORER_AGGREGATIONS}
              getLabel={a => t(`aggregations.${a}`)}
              onChange={setAggregation}
            />
          </Grid>
        </Grid>

        {data && (
          <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 2, flexWrap: 'wrap' }}>
            <Chip label={t('summary.count', { value: data.total.count })} />
            <Chip label={t('summary.average', { value: formatValue(data.total.average) })} />
            <Chip label={t('summary.median', { value: formatValue(data.total.median) })} />
            <Chip label={t('summary.min', { value: formatValue(data.total.min) })} />
            <Chip label={t('summary.max', { value: formatValue(data.total.max) })} />
            <Chip label={t('summary.std-dev', { value: formatValue(data.total.stdDev) })} />
          </Stack>
        )}
      </Paper>

      <ChartCard
        title={t('results')}
        loading={isLoading}
        empty={!!error || rows.length === 0}
        height={view === 'chart' ? 420 : 'auto'}
        ltr={view === 'chart'}
        action={
          <Stack direction="row" spacing={1}>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={view}
              onChange={(_, value) => value && setView(value)}
            >
              <ToggleButton value="chart" aria-label={t('views.chart')}>
                <BarChartOutlined fontSize="small" />
              </ToggleButton>
              <ToggleButton value="table" aria-label={t('views.table')}>
                <TableRowsOutlined fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
            <Button
              size="small"
              startIcon={<Download />}
              onClick={downloadCsv}
              disabled={rows.length === 0}
            >
              {t('export')}
            </Button>
          </Stack>
        }
      >
        {view === 'chart' ? (
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                angle={-35}
                textAnchor="end"
                interval={0}
                tick={{ fontSize: 11 }}
              />
              <YAxis unit={isDuration ? t('minutes-unit') : undefined} />
              <Tooltip
                {...tooltipStyle}
                formatter={value =>
                  isDuration ? formatDuration((value as number) * 60) : (value as number)
                }
              />
              <Bar
                dataKey="value"
                name={t(`aggregations.${aggregation}`)}
                fill={CHART_COLORS.primary}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <TableContainer sx={{ maxHeight: 520 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>{t('columns.group')}</TableCell>
                  <TableCell align="right">{t(`aggregations.${aggregation}`)}</TableCell>
                  <TableCell align="right">{t('columns.count')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(row => (
                  <TableRow key={row.key} hover>
                    <TableCell>{row.label}</TableCell>
                    <TableCell align="right">{formatValue(row.value)}</TableCell>
                    <TableCell align="right">{row.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </ChartCard>
    </Stack>
  );
};
