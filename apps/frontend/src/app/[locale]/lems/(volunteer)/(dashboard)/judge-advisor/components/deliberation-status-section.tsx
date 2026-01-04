'use client';

import { useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useTranslations } from 'next-intl';
import { useJudgeAdvisor } from './judge-advisor-context';

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

export function DeliberationStatusSection() {
  const t = useTranslations('pages.judge-advisor');
  const { deliberations, finalDeliberation, loading } = useJudgeAdvisor();

  const categoriesWithStatuses = useMemo(() => {
    const categories = ['innovation_project', 'robot_design', 'core_values'];
    return categories.map(category => {
      const deliberation = deliberations.find(d => d.category === category);
      return {
        category,
        deliberation
      };
    });
  }, [deliberations]);

  return (
    <Stack spacing={3}>
      {/* Category Deliberations */}
      <Card>
        <CardHeader title={t('awards.deliberation.category-deliberations-title')} />
        <CardContent>
          {categoriesWithStatuses.length > 0 ? (
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                  <TableCell>{t('awards.deliberation.category')}</TableCell>
                  <TableCell>{t('awards.deliberation.status')}</TableCell>
                  <TableCell>{t('awards.deliberation.picklist')}</TableCell>
                  <TableCell>{t('awards.deliberation.start-time')}</TableCell>
                  <TableCell align="right">{t('awards.deliberation.action')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categoriesWithStatuses.map(({ category, deliberation }) => (
                  <TableRow key={category}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {t(`awards.deliberation.category-${category}`)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {deliberation ? (
                        <Chip
                          label={deliberation.status}
                          color={getDeliberationStatusColor(deliberation.status)}
                          size="small"
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {deliberation ? (
                        <Typography variant="body2">
                          {deliberation.picklist.length} / {t('awards.deliberation.desired-length')}
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{deliberation ? formatTime(deliberation.startTime) : '—'}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        endIcon={<OpenInNewIcon />}
                        target="_blank"
                        href={`/lems/deliberation/${category}`}
                        disabled={loading}
                      >
                        {t('awards.deliberation.open')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t('awards.deliberation.no-deliberations')}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Final Deliberation */}
      {finalDeliberation && (
        <Card>
          <CardHeader title={t('awards.deliberation.final-deliberation-title')} />
          <CardContent>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('awards.deliberation.stage')}
                  </Typography>
                  <Chip
                    label={finalDeliberation.stage}
                    color={getFinalDeliberationStageColor(finalDeliberation.stage)}
                    size="small"
                    variant="outlined"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('awards.deliberation.status')}
                  </Typography>
                  <Chip
                    label={finalDeliberation.status}
                    color={getDeliberationStatusColor(finalDeliberation.status)}
                    size="small"
                    variant="outlined"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('awards.deliberation.start-time')}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {formatTime(finalDeliberation.startTime)}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('awards.deliberation.completion-time')}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {formatTime(finalDeliberation.completionTime)}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  endIcon={<OpenInNewIcon />}
                  target="_blank"
                  href="/lems/deliberation/final"
                  disabled={loading}
                >
                  {t('awards.deliberation.open-final')}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
