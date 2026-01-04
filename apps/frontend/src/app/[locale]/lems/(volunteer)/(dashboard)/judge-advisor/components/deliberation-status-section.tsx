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
  Typography,
  useTheme,
  alpha,
  Paper
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
  const t = useTranslations('pages.judge-advisor.awards.deliberation');
  const { deliberations, finalDeliberation, loading } = useJudgeAdvisor();
  const theme = useTheme();

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
        <CardHeader
          title={t('category-deliberations-title')}
          titleTypographyProps={{ variant: 'h6' }}
        />
        <CardContent>
          {categoriesWithStatuses.length > 0 ? (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.08) }}>
                    <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>{t('category')}</TableCell>
                    <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>{t('status')}</TableCell>
                    <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>{t('picklist')}</TableCell>
                    <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>{t('start-time')}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, minWidth: 100 }}>
                      {t('action')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categoriesWithStatuses.map(({ category, deliberation }, index) => (
                    <TableRow
                      key={category}
                      sx={{
                        backgroundColor:
                          index % 2 === 0
                            ? 'background.paper'
                            : alpha(theme.palette.action.hover, 0.3),
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.05)
                        }
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>{t(`category-${category}`)}</TableCell>
                      <TableCell>
                        {deliberation ? (
                          <Chip
                            label={deliberation.status}
                            color={getDeliberationStatusColor(deliberation.status)}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {deliberation ? (
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {deliberation.picklist.length} / {t('desired-length')}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {deliberation ? formatTime(deliberation.startTime) : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                          target="_blank"
                          href={`/lems/deliberation/${category}`}
                          disabled={loading}
                          sx={{ whiteSpace: 'nowrap' }}
                        >
                          {t('open')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          ) : (
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                backgroundColor: alpha(theme.palette.info.main, 0.05),
                borderLeft: `4px solid ${theme.palette.info.main}`
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {t('no-deliberations')}
              </Typography>
            </Paper>
          )}
        </CardContent>
      </Card>

      {/* Final Deliberation */}
      {finalDeliberation && (
        <Card sx={{ borderLeft: `4px solid ${theme.palette.warning.main}` }}>
          <CardHeader
            title={t('final-deliberation-title')}
            titleTypographyProps={{ variant: 'h6' }}
          />
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
                    label={finalDeliberation.stage}
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
                    label={finalDeliberation.status}
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
      )}
    </Stack>
  );
}
