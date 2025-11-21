'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Stack, Container, Box, Typography, Alert } from '@mui/material';
import { ResponsiveComponent } from '@lems/shared';
import { PageHeader } from '../../components/page-header';
import { useEvent } from '../../../components/event-context';
import { usePageData } from '../../../hooks/use-page-data';
import {
  GET_DIVISION_TEAMS,
  parseDivisionTeams,
  createTeamRegistrationSubscription
} from './team-list.graphql';
import { MobileTeamListTable } from './components/mobile-team-list-table';
import { DesktopTeamListTable } from './components/desktop-team-list-table';
import { ArrivalStats } from './components/arrival-stats';

export default function TeamListPage() {
  const t = useTranslations('pages.reports.team-list');
  const { currentDivision } = useEvent();

  const subscriptions = useMemo(
    () => [createTeamRegistrationSubscription(currentDivision.id)],
    [currentDivision.id]
  );

  const {
    data: teams = [],
    loading,
    error
  } = usePageData(
    GET_DIVISION_TEAMS,
    { divisionId: currentDivision.id },
    parseDivisionTeams,
    subscriptions
  );

  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={{ xs: 3, sm: 4, md: 5 }}>
        <PageHeader title={t('page-title')} />
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 3, md: 4 }
          }}
        >
          <Stack spacing={3}>
            <ResponsiveComponent desktop={<ArrivalStats teams={teams} />} mobile={null} />

            {error && (
              <Alert severity="error" variant="outlined" sx={{ borderRadius: 2 }}>
                <Typography variant="body2" color="error.dark">
                  {t('error-loading')}
                </Typography>
              </Alert>
            )}

            {!error && (
              <ResponsiveComponent
                mobile={<MobileTeamListTable teams={teams} />}
                desktop={<DesktopTeamListTable teams={teams} />}
              />
            )}

            {loading && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">{t('loading')}</Typography>
              </Box>
            )}
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
