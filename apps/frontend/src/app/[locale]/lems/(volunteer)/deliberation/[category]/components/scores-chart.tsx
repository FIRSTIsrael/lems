'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  ComposedChart,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import { blue, green, red } from '@mui/material/colors';
import { useCategoryDeliberation } from '../deliberation-context';

export function ScoresChart() {
  const theme = useTheme();
  const t = useTranslations('pages.deliberations.category.scores-chart');
  const { roomMetrics, teams } = useCategoryDeliberation();

  // Compute room metrics with useMemo to avoid unnecessary recalculations
  const chartData = useMemo(() => {
    // Transform room metrics into chart-friendly format
    const data = Object.entries(roomMetrics)
      .sort(([, a], [, b]) => a.teamCount - b.teamCount) // Sort by team count for better visualization
      .map(([roomId, metrics]) => {
        const room = teams.find(t => t.room?.id === roomId)?.room;

        return {
          name: room?.name || `Room ${roomId.slice(0, 4)}`,
          'innovation-project': parseFloat(
            (metrics.avgScores['innovation-project'] || 0).toFixed(2)
          ),
          'robot-design': parseFloat((metrics.avgScores['robot-design'] || 0).toFixed(2)),
          'core-values': parseFloat((metrics.avgScores['core-values'] || 0).toFixed(2)),
          aggregate: parseFloat((metrics.avgScores.total || 0).toFixed(2)),
          teamCount: metrics.teamCount
        };
      });

    return data;
  }, [roomMetrics, teams]);

  // Calculate domain for Y axis
  const maxScore = useMemo(() => {
    if (chartData.length === 0) return 100;
    return Math.ceil(
      Math.max(
        ...chartData.map(d =>
          Math.max(d['innovation-project'], d['robot-design'], d['core-values'], d.aggregate)
        )
      )
    );
  }, [chartData]);

  return (
    <Stack height="100%" width="100%" spacing={2} overflow="hidden">
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 600, color: 'text.secondary', flexShrink: 0 }}
      >
        {t('room-scores-distribution')}
      </Typography>

      {chartData.length === 0 ? (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {t('no-data-available')}
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 0, bottom: 80 }}
            style={{
              direction: theme.direction === 'rtl' ? 'rtl' : 'ltr'
            }}
          >
            <defs>
              <linearGradient id="aggregateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8} />
                <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis domain={[0, maxScore]} textAnchor="start" tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value: number) => {
                if (typeof value === 'number') {
                  return value.toFixed(2);
                }
                return value;
              }}
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '8px'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />

            {/* Category bars */}
            <Bar
              dataKey="innovation-project"
              fill={blue[400]}
              name={t('innovation-project')}
              barSize={16}
            />
            <Bar dataKey="robot-design" fill={green[400]} name={t('robot-design')} barSize={16} />
            <Bar dataKey="core-values" fill={red[400]} name={t('core-values')} barSize={16} />

            {/* Aggregate area */}
            <Area
              type="monotone"
              dataKey="aggregate"
              stroke={theme.palette.primary.main}
              fill="url(#aggregateGradient)"
              fillOpacity={1}
              name={t('aggregate-average')}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </Stack>
  );
}
