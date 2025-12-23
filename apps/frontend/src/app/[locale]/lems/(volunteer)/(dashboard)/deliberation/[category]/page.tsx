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
  Button
} from '@mui/material';
import { useMutation } from '@apollo/client/react';
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
  START_DELIBERATION_MUTATION
} from './graphql';

export default function CategoryDeliberationPage() {
  const t = useTranslations('pages.deliberation');
  const { getCategory } = useJudgingCategoryTranslations();
  const { currentDivision } = useEvent();
  const { category }: { category: JudgingCategory } = useParams();

  const categoryEnum = hyphensToUnderscores(category) as JudgingCategory;

  const subscriptions = useMemo(
    () => [createDeliberationUpdatedSubscription(currentDivision.id)],
    [currentDivision.id]
  );

  const {
    data: division,
    loading,
    refetch
  } = usePageData(
    GET_CATEGORY_DELIBERATION,
    {
      divisionId: currentDivision.id,
      category: categoryEnum
    },
    parseCategoryDeliberationData,
    subscriptions
  );

  const [startDeliberation, { loading: startLoading }] = useMutation(START_DELIBERATION_MUTATION, {
    onCompleted: () => {
      refetch();
    }
  });

  const handleStartDeliberation = async () => {
    await startDeliberation({
      variables: {
        divisionId: currentDivision.id,
        category: categoryEnum
      }
    });
  };

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

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          {/* Division Header */}
          <Paper sx={{ p: 3, bgcolor: division.color, color: 'white' }}>
            <Typography variant="h5" component="h2">
              {division.name}
            </Typography>
          </Paper>

          {/* Deliberation Status */}
          <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  justifyContent: 'space-between'
                }}
              >
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {t('status')}
                  </Typography>
                  <Chip
                    label={deliberation?.status || 'not-started'}
                    color={statusColor[deliberation?.status || 'not-started']}
                    variant="filled"
                  />
                </Box>
                {deliberation?.status === 'not-started' && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleStartDeliberation}
                    disabled={startLoading}
                  >
                    {t('start-deliberation')}
                  </Button>
                )}
              </Box>

              {deliberation?.startTime && (
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    {t('started-at')}: {new Date(deliberation.startTime).toLocaleString()}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Paper>

          {/* Teams List */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('teams')}
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell>{t('team-number')}</TableCell>
                    <TableCell>{t('team-name')}</TableCell>
                    <TableCell>{t('affiliation')}</TableCell>
                    <TableCell>{t('city')}</TableCell>
                    <TableCell>{t('region')}</TableCell>
                    <TableCell align="center">{t('arrived')}</TableCell>
                    <TableCell align="center">{t('disqualified')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {division.teams.map((team: (typeof division.teams)[0]) => (
                    <TableRow
                      key={team.id}
                      sx={{
                        bgcolor: deliberation?.picklist.includes(team.id)
                          ? 'success.light'
                          : 'inherit',
                        opacity: team.disqualified ? 0.5 : 1
                      }}
                    >
                      <TableCell>{team.number}</TableCell>
                      <TableCell>{team.name}</TableCell>
                      <TableCell>{team.affiliation}</TableCell>
                      <TableCell>{team.city}</TableCell>
                      <TableCell>{team.region}</TableCell>
                      <TableCell align="center">{team.arrived ? '✓' : '✗'}</TableCell>
                      <TableCell align="center">{team.disqualified ? '✓' : '✗'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Picklist */}
          {deliberation?.status === 'in-progress' && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('picklist')}
              </Typography>
              <Stack spacing={2}>
                <Typography variant="body2" color="textSecondary">
                  {t('picklist-description')}
                </Typography>

                {deliberation.picklist.length > 0 ? (
                  <Stack spacing={1}>
                    {deliberation.picklist.map((teamId: string, index: number) => {
                      const team = division.teams.find(
                        (t: (typeof division.teams)[0]) => t.id === teamId
                      );
                      return team ? (
                        <Box
                          key={teamId}
                          sx={{
                            p: 2,
                            bgcolor: 'grey.100',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <Typography>
                            {index + 1}. {team.number} - {team.name}
                          </Typography>
                        </Box>
                      ) : null;
                    })}
                  </Stack>
                ) : (
                  <Typography color="textSecondary">{t('no-picklist')}</Typography>
                )}
              </Stack>
            </Paper>
          )}
        </Stack>
      </Container>
    </>
  );
}
