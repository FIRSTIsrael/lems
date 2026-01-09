'use client';

import { Paper, Stack, Typography, Box, LinearProgress, Chip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { useFieldMetrics, formatMinutes } from '../hooks/useFieldMetrics';

interface Match {
  id: string;
  scheduledTime: string;
  status: string;
  startTime?: string | null;
  startDelta?: number | null;
}

interface FieldHealthMetricsProps {
  matches: Match[];
}

/**
 * Display field performance metrics
 * Shows completion rate, delays, and on-time performance
 */
export function FieldHealthMetrics({ matches }: FieldHealthMetricsProps) {
  const metrics = useFieldMetrics(matches);

  const getPaceIcon = () => {
    if (metrics.isOnTrack) return <TrendingFlatIcon color="success" />;
    if (metrics.isBehind) return <TrendingDownIcon color="error" />;
    return <TrendingUpIcon color="success" />;
  };

  const getPaceColor = () => {
    if (metrics.isOnTrack) return 'success.main';
    return 'error.main';
  };

  return (
    <Paper sx={{ p: 3, mt: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={600}>
          📊 ביצועי הזירה
        </Typography>

        <Stack spacing={2}>
          {/* Completion Rate */}
          <Box>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
              mb={1}
            >
              <Typography variant="body2" color="text.secondary">
                מקצים שהושלמו
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {metrics.completedMatches}/{metrics.totalMatches}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={metrics.completionRate}
              sx={{ height: 8, borderRadius: 1 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {metrics.completionRate.toFixed(1)}%
            </Typography>
          </Box>

          {/* On-Time Performance */}
          <Box>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
              mb={1}
            >
              <Typography variant="body2" color="text.secondary">
                התחלות בזמן (±2 דקות)
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {metrics.onTimeMatches}/{metrics.completedMatches}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={metrics.onTimeRate}
              color={
                metrics.onTimeRate >= 80
                  ? 'success'
                  : metrics.onTimeRate >= 60
                    ? 'warning'
                    : 'error'
              }
              sx={{ height: 8, borderRadius: 1 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {metrics.onTimeRate.toFixed(1)}%
            </Typography>
          </Box>

          {/* Statistics Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2,
              mt: 2
            }}
          >
            <Box
              sx={{
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 2
              }}
            >
              <Typography variant="caption" color="text.secondary">
                עיכוב ממוצע
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {formatMinutes(metrics.averageDelay)}
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 2
              }}
            >
              <Typography variant="caption" color="text.secondary">
                עיכוב מקסימלי
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {formatMinutes(metrics.largestDelay)}
              </Typography>
            </Box>
          </Box>

          {/* Current Pace */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'background.default',
              borderRadius: 2,
              border: '2px solid',
              borderColor: metrics.isOnTrack ? 'success.main' : 'error.main'
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={1} alignItems="center">
                {getPaceIcon()}
                <Typography variant="subtitle1" fontWeight={600}>
                  קצב נוכחי
                </Typography>
              </Stack>
              <Chip
                label={
                  metrics.isBehind ? `${formatMinutes(Math.abs(metrics.currentPace))} מאחר` : 'בזמן'
                }
                color={metrics.isOnTrack ? 'success' : 'error'}
                size="small"
              />
            </Stack>
          </Box>
        </Stack>
      </Stack>
    </Paper>
  );
}
