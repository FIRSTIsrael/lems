'use client';

import dayjs from 'dayjs';
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Paper,
  Typography,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useJudgingDeliberationTranslations } from '@lems/localization';
import { FinalDeliberationButton } from './final-deliberation-button';
import { useJudgeAdvisor } from '../judge-advisor-context';

function getDeliberationStatusColor(
  status: string
): 'default' | 'primary' | 'success' | 'warning' | 'error' {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in-progress':
      return 'primary';
    case 'not-started':
      return 'default';
    default:
      return 'default';
  }
}

function getFinalDeliberationStageColor(
  stage: string
): 'default' | 'primary' | 'success' | 'warning' | 'error' {
  switch (stage) {
    case 'review':
      return 'success';
    case 'optional-awards':
    case 'core-awards':
    case 'champions':
      return 'primary';
    case 'not-started':
      return 'default';
    default:
      return 'default';
  }
}

export interface FinalDeliberation {
  stage: string;
  status: string;
  startTime?: string;
  completionTime?: string;
}

interface FinalDeliberationCardProps {
  finalDeliberation: FinalDeliberation;
  loading: boolean;
}

export function FinalDeliberationCard({ finalDeliberation, loading }: FinalDeliberationCardProps) {
  const t = useTranslations('pages.judge-advisor.awards.deliberation');
  const { getStage, getStatus } = useJudgingDeliberationTranslations();
  const theme = useTheme();
  const { deliberations } = useJudgeAdvisor();

  return (
    <Card sx={{ backgroundColor: alpha(theme.palette.background.paper, 0.95) }}>
      <CardHeader
        title={t('final-deliberation-title')}
        slotProps={{ title: { variant: 'h6', sx: { fontWeight: 500 } } }}
        sx={{ pb: 1 }}
      />
      <CardContent>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Paper
              sx={{
                p: 2,
                backgroundColor: alpha(theme.palette.grey[500], 0.04),
                border: 'none'
              }}
              elevation={0}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mb: 0.75, fontWeight: 500 }}
              >
                {t('stage')}
              </Typography>
              <Chip
                label={getStage(finalDeliberation.stage)}
                color={getFinalDeliberationStageColor(finalDeliberation.stage)}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 500 }}
              />
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Paper
              sx={{
                p: 2,
                backgroundColor: alpha(theme.palette.grey[500], 0.04),
                border: 'none'
              }}
              elevation={0}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mb: 0.75, fontWeight: 500 }}
              >
                {t('status')}
              </Typography>
              <Chip
                label={getStatus(finalDeliberation.status)}
                color={getDeliberationStatusColor(finalDeliberation.status)}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 500 }}
              />
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Paper
              sx={{
                p: 2,
                backgroundColor: alpha(theme.palette.grey[500], 0.04),
                border: 'none'
              }}
              elevation={0}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mb: 0.75, fontWeight: 500 }}
              >
                {t('start-time')}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 400 }}>
                {finalDeliberation.startTime
                  ? dayjs(finalDeliberation.startTime).format('HH:mm')
                  : '-'}
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FinalDeliberationButton deliberations={deliberations} loading={loading} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
