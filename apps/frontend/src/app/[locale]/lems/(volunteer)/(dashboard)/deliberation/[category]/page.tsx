'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Container,
  CircularProgress,
  Box,
  Stack,
  Paper,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Divider
} from '@mui/material';
import { JudgingCategory } from '@lems/types/judging';
import { hyphensToUnderscores } from '@lems/shared/utils';
import { useJudgingCategoryTranslations } from '@lems/localization';
import { PageHeader } from '../../components/page-header';
import { useEvent } from '../../../components/event-context';
import { usePageData } from '../../../hooks/use-page-data';
import {
  GET_CATEGORY_DELIBERATION,
  parseCategoryDeliberationData,
  createDeliberationUpdatedSubscription,
  createTeamArrivalUpdatedSubscription,
  createRubricUpdatedSubscription,
  createScoresheetUpdatedSubscription
} from './graphql';

export default function CategoryDeliberationPage() {
  const t = useTranslations('pages.deliberation');
  const { getCategory } = useJudgingCategoryTranslations();
  const { currentDivision } = useEvent();
  const { category }: { category: JudgingCategory } = useParams();

  const categoryEnum = hyphensToUnderscores(category) as JudgingCategory;

  const subscriptions = useMemo(
    () => [
      createDeliberationUpdatedSubscription(currentDivision.id),
      createTeamArrivalUpdatedSubscription(currentDivision.id),
      createRubricUpdatedSubscription(currentDivision.id),
      createScoresheetUpdatedSubscription(currentDivision.id)
    ],
    [currentDivision.id]
  );

  const { data: division, loading } = usePageData(
    GET_CATEGORY_DELIBERATION,
    {
      divisionId: currentDivision.id,
      category: categoryEnum
    },
    parseCategoryDeliberationData,
    subscriptions
  );

  if (loading || !division) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const deliberation = division.judging.deliberation;
  const statusColor: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
    NOT_STARTED: 'default',
    IN_PROGRESS: 'warning',
    COMPLETED: 'success'
  };

  return (
    <>
      <PageHeader
        title={t('page-title', {
          category: getCategory(category as string)
        })}
      />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={4}>
          {/* Division Information */}
          <Paper sx={{ p: 3, bgcolor: division.color, color: 'white' }}>
            <Typography variant="h5" component="h2">
              {t('division')}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              {division.name}
            </Typography>
          </Paper>

          {/* Deliberation Information */}
          {deliberation && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('deliberation')}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {t('id')}
                  </Typography>
                  <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                    {deliberation.id}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {t('status')}
                  </Typography>
                  <Chip
                    label={deliberation.status || 'not-started'}
                    color={statusColor[deliberation.status || 'not-started']}
                    variant="filled"
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {t('category')}
                  </Typography>
                  <Typography variant="body1">{deliberation.category}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {t('started-at')}
                  </Typography>
                  <Typography variant="body1">
                    {deliberation.startTime
                      ? new Date(deliberation.startTime).toLocaleString()
                      : '—'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Picklist */}
          {deliberation?.picklist && deliberation.picklist.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('picklist')} ({deliberation.picklist.length})
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1}>
                {deliberation.picklist.map((teamId: string, index: number) => {
                  const team = division.teams.find(
                    (t: (typeof division.teams)[0]) => t.id === teamId
                  );
                  return (
                    <Box key={teamId} sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="body2">
                        <strong>{index + 1}.</strong> {team?.number} - {team?.name}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            </Paper>
          )}

          {/* Teams Data */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('teams')} ({division.teams.length})
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={3}>
              {division.teams.map((team: (typeof division.teams)[0]) => (
                <Box
                  key={team.id}
                  sx={{
                    p: 2.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: deliberation?.picklist.includes(team.id) ? 'success.light' : 'inherit',
                    opacity: team.disqualified ? 0.6 : 1
                  }}
                >
                  {/* Team Header */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {t('team-number')}
                      </Typography>
                      <Typography variant="body1">{team.number}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {t('team-name')}
                      </Typography>
                      <Typography variant="body1">{team.name}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {t('affiliation')}
                      </Typography>
                      <Typography variant="body1">{team.affiliation}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {t('slug')}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ fontSize: '0.875rem', wordBreak: 'break-all' }}
                      >
                        {team.slug}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {t('city')}
                      </Typography>
                      <Typography variant="body1">{team.city}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {t('region')}
                      </Typography>
                      <Typography variant="body1">{team.region}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {t('arrived')}
                      </Typography>
                      <Chip
                        label={team.arrived ? 'Yes' : 'No'}
                        color={team.arrived ? 'success' : 'error'}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {t('disqualified')}
                      </Typography>
                      <Chip
                        label={team.disqualified ? 'Yes' : 'No'}
                        color={team.disqualified ? 'error' : 'success'}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                  </Grid>

                  {/* Judging Session */}
                  {team.judgingSession && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        {t('judging-session')}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            ID
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ fontSize: '0.875rem', wordBreak: 'break-all' }}
                          >
                            {team.judgingSession.id}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            {t('room')}
                          </Typography>
                          <Typography variant="body1">
                            {team.judgingSession.room.name} (ID: {team.judgingSession.room.id})
                          </Typography>
                        </Grid>
                      </Grid>
                    </>
                  )}

                  {/* Scoresheets */}
                  {team.scoresheets && team.scoresheets.length > 0 && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        {t('scoresheets')} ({team.scoresheets.length})
                      </Typography>
                      <TableContainer sx={{ maxHeight: 300 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.100' }}>
                              <TableCell>{t('round')}</TableCell>
                              <TableCell>{t('slug')}</TableCell>
                              <TableCell align="right">{t('score')}</TableCell>
                              <TableCell align="right">GP</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {team.scoresheets.map(scoresheet => (
                              <TableRow key={scoresheet.id}>
                                <TableCell>{scoresheet.round}</TableCell>
                                <TableCell sx={{ fontSize: '0.875rem' }}>
                                  {scoresheet.slug}
                                </TableCell>
                                <TableCell align="right">{scoresheet.data?.score ?? '—'}</TableCell>
                                <TableCell align="right">
                                  {scoresheet.data?.gp ? (
                                    <Box>
                                      <Typography variant="caption" display="block">
                                        Value: {scoresheet.data.gp.value ?? '—'}
                                      </Typography>
                                      {scoresheet.data.gp.notes && (
                                        <Typography variant="caption" color="textSecondary">
                                          Notes: {scoresheet.data.gp.notes}
                                        </Typography>
                                      )}
                                    </Box>
                                  ) : (
                                    '—'
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </>
                  )}

                  {/* Rubrics */}
                  {team.rubrics && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        {t('rubrics')}
                      </Typography>
                      <Stack spacing={2}>
                        {['innovation_project', 'robot_design', 'core_values'].map(rubricType => {
                          const rubric = team.rubrics[rubricType as keyof typeof team.rubrics];
                          if (!rubric) return null;

                          return (
                            <Box
                              key={rubricType}
                              sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}
                            >
                              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                                {rubricType.replace(/_/g, ' ').toUpperCase()}
                              </Typography>
                              <Grid container spacing={1} sx={{ mt: 0.5 }}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <Typography variant="body2" color="textSecondary" gutterBottom>
                                    ID
                                  </Typography>
                                  <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                                    {rubric.id}
                                  </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <Typography variant="body2" color="textSecondary" gutterBottom>
                                    Status
                                  </Typography>
                                  <Chip label={rubric.status} variant="outlined" size="small" />
                                </Grid>
                              </Grid>

                              {rubric.data && (
                                <>
                                  {Object.keys(rubric.data.fields).length > 0 && (
                                    <>
                                      <Typography
                                        variant="caption"
                                        display="block"
                                        sx={{ mt: 1, fontWeight: 600 }}
                                      >
                                        Fields:
                                      </Typography>
                                      <Box sx={{ mt: 0.5, ml: 1 }}>
                                        {Object.entries(rubric.data.fields).map(
                                          ([fieldName, fieldValue]) => (
                                            <Box key={fieldName} sx={{ mb: 0.5 }}>
                                              <Typography variant="caption" color="textSecondary">
                                                {fieldName}:
                                              </Typography>
                                              <Typography variant="caption" display="block">
                                                Value: {fieldValue.value ?? '—'}
                                                {fieldValue.notes && ` (${fieldValue.notes})`}
                                              </Typography>
                                            </Box>
                                          )
                                        )}
                                      </Box>
                                    </>
                                  )}

                                  {rubric.data.feedback && (
                                    <>
                                      <Typography
                                        variant="caption"
                                        display="block"
                                        sx={{ mt: 1, fontWeight: 600 }}
                                      >
                                        Feedback:
                                      </Typography>
                                      <Box sx={{ mt: 0.5, ml: 1 }}>
                                        <Typography
                                          variant="caption"
                                          color="textSecondary"
                                          display="block"
                                        >
                                          Great Job:
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          display="block"
                                          sx={{ mb: 0.5 }}
                                        >
                                          {rubric.data.feedback.greatJob}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          color="textSecondary"
                                          display="block"
                                        >
                                          Think About:
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                          {rubric.data.feedback.thinkAbout}
                                        </Typography>
                                      </Box>
                                    </>
                                  )}

                                  {rubric.data.awards &&
                                    Object.keys(rubric.data.awards).length > 0 && (
                                      <>
                                        <Typography
                                          variant="caption"
                                          display="block"
                                          sx={{ mt: 1, fontWeight: 600 }}
                                        >
                                          Awards:
                                        </Typography>
                                        <Box sx={{ mt: 0.5, ml: 1 }}>
                                          {Object.entries(rubric.data.awards).map(
                                            ([awardName, isAwarded]) => (
                                              <Typography
                                                key={awardName}
                                                variant="caption"
                                                display="block"
                                              >
                                                {awardName}: {isAwarded ? '✓' : '✗'}
                                              </Typography>
                                            )
                                          )}
                                        </Box>
                                      </>
                                    )}
                                </>
                              )}
                            </Box>
                          );
                        })}
                      </Stack>
                    </>
                  )}
                </Box>
              ))}
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </>
  );
}
