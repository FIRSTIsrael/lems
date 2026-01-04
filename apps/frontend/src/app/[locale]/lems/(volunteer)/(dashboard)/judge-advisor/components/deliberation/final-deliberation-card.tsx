'use client';

import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Paper,
  Button,
  Typography,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useTranslations } from 'next-intl';

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

function formatTime(isoString?: string): string {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
  const tStatus = useTranslations('common.statuses');
  const theme = useTheme();

  return (
    <Card sx={{ borderLeft: `4px solid ${theme.palette.warning.main}` }}>
      <CardHeader title={t('final-deliberation-title')} titleTypographyProps={{ variant: 'h6' }} />
      <CardContent>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper
              sx={{
                p: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mb: 0.5 }}
              >
                {t('stage')}
              </Typography>
              <Chip
                label={tStatus(`final-deliberation-stage.${finalDeliberation.stage}`)}
                color={getFinalDeliberationStageColor(finalDeliberation.stage)}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper
              sx={{
                p: 2,
                backgroundColor: alpha(theme.palette.success.main, 0.05),
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mb: 0.5 }}
              >
                {t('status')}
              </Typography>
              <Chip
                label={tStatus(`deliberation.${finalDeliberation.status}`)}
                color={getDeliberationStatusColor(finalDeliberation.status)}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper
              sx={{
                p: 2,
                backgroundColor: alpha(theme.palette.info.main, 0.05),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mb: 0.5 }}
              >
                {t('start-time')}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {formatTime(finalDeliberation.startTime)}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper
              sx={{
                p: 2,
                backgroundColor: alpha(theme.palette.info.main, 0.05),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mb: 0.5 }}
              >
                {t('completion-time')}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {formatTime(finalDeliberation.completionTime)}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Button
              fullWidth
              variant="contained"
              endIcon={<OpenInNewIcon />}
              target="_blank"
              href="/lems/deliberation/final"
              disabled={loading}
              sx={{
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              {t('open-final')}
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
