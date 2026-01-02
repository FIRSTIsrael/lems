'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ComposedChart,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Autocomplete,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
  alpha
} from '@mui/material';
import { blue, green, red } from '@mui/material/colors';
import { CompareArrows } from '@mui/icons-material';
import { useCategoryDeliberation } from '../deliberation-context';

export function ScoresChart() {
  const theme = useTheme();
  const t = useTranslations('pages.deliberations.category.scores-chart');
  const { roomMetrics, teams } = useCategoryDeliberation();
  const [selectedTeam1, setSelectedTeam1] = useState<string | null>(null);
  const [selectedTeam2, setSelectedTeam2] = useState<string | null>(null);

  const teamOptions = teams.map(t => ({
    label: `${t.number} - ${t.name}`,
    value: t.id
  }));

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
          'core-values': parseFloat((metrics.avgScores['core-values-no-gp'] || 0).toFixed(2)),
          aggregate: parseFloat((metrics.avgScores.total / 3 || 0).toFixed(2)),
          teamCount: metrics.teamCount
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

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
    <Stack direction="row" spacing={2.5} height={270}>
      <Paper
        sx={{
          width: '75%',
          display: 'flex',
          flexDirection: 'column',
          p: 2.5,
          userSelect: 'none',
          backdropFilter: 'blur(8px)',
          border: theme => `1px solid ${theme.palette.divider}`
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            flexShrink: 0,
            mb: 2,
            fontSize: '0.95rem',
            letterSpacing: '0.5px'
          }}
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
          <ResponsiveContainer>
            <ComposedChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 0, bottom: 0 }}
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

              <CartesianGrid
                strokeDasharray="3 3"
                stroke={alpha(theme.palette.divider, 0.3)}
                vertical={false}
              />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} />
              <YAxis
                domain={[0, maxScore]}
                tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                width={40}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} iconType="rect" />

              {/* Category bars */}
              <Bar
                dataKey="innovation-project"
                fill={blue[400]}
                name={t('innovation-project')}
                barSize={16}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="robot-design"
                fill={green[400]}
                name={t('robot-design')}
                barSize={16}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="core-values"
                fill={red[400]}
                name={t('core-values')}
                barSize={16}
                radius={[4, 4, 0, 0]}
              />

              <Area
                type="monotone"
                dataKey="aggregate"
                stroke={theme.palette.primary.main}
                fill="url(#aggregateGradient)"
                fillOpacity={1}
                name={t('aggregate-average')}
                strokeWidth={2.5}
                isAnimationActive
                activeDot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </Paper>
      <Stack
        component={Paper}
        p={2.5}
        width="25%"
        justifyContent="space-between"
        sx={{
          border: theme => `1px solid ${theme.palette.divider}`
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              fontSize: '0.95rem',
              color: 'text.primary',
              letterSpacing: '0.5px'
            }}
          >
            {t('compare-teams')}
          </Typography>
          <CompareArrows />
        </Stack>

        <Autocomplete
          options={teamOptions}
          value={teamOptions.find(o => o.value === selectedTeam1) || null}
          onChange={(_, value) => setSelectedTeam1(value?.value || null)}
          renderInput={params => (
            <TextField
              {...params}
              label={t('team-1')}
              size="small"
              variant="outlined"
              slotProps={{
                input: {
                  ...params.InputProps,
                  sx: {
                    fontSize: '0.875rem'
                  }
                }
              }}
            />
          )}
          size="small"
          fullWidth
          noOptionsText={t('no-data-available')}
        />
        <Autocomplete
          options={teamOptions}
          value={teamOptions.find(o => o.value === selectedTeam2) || null}
          onChange={(_, value) => setSelectedTeam2(value?.value || null)}
          renderInput={params => (
            <TextField
              {...params}
              label={t('team-2')}
              size="small"
              variant="outlined"
              slotProps={{
                input: {
                  ...params.InputProps,
                  sx: {
                    fontSize: '0.875rem'
                  }
                }
              }}
            />
          )}
          size="small"
          fullWidth
          noOptionsText={t('no-data-available')}
        />

        <Button
          variant="contained"
          fullWidth
          disabled={!selectedTeam1 || !selectedTeam2 || selectedTeam1 === selectedTeam2}
          size="small"
          sx={{
            mt: 1,
            fontWeight: 600,
            fontSize: '0.875rem',
            textTransform: 'none',
            py: 1.25,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover:not(:disabled)': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)'
            }
          }}
        >
          {t('compare')}
        </Button>
      </Stack>
    </Stack>
  );
}
