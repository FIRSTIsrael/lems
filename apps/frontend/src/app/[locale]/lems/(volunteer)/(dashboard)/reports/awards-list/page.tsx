'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Stack, Container, Box, Typography } from '@mui/material';
import { PageHeader } from '../../components/page-header';
import { useEvent } from '../../../components/event-context';
import { usePageData } from '../../../hooks/use-page-data';
import { GET_DIVISION_AWARDS, parseDivisionAwards, Award } from './awards-list.graphql';
import { AwardsList } from './components/awards-list';
import { ErrorState } from './components/error-state';
import { EmptyState } from './components/empty-state';
import { LoadingState } from './components/loading-state';

export default function AwardsListPage() {
  const t = useTranslations('pages.reports.awards-list');
  const { currentDivision } = useEvent();

  const {
    data: awards = [],
    loading,
    error
  } = usePageData(GET_DIVISION_AWARDS, { divisionId: currentDivision.id }, parseDivisionAwards);

  const groupedAwards = useMemo(() => {
    const groups: Record<string, Award[]> = {};
    awards.forEach(award => {
      groups[award.name] = [award];
    });
    return groups;
  }, [awards]);

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
            <Typography variant="body1" color="text.secondary">
              {t('description')}
            </Typography>

            {error && <ErrorState />}

            {!error && awards.length === 0 && !loading && <EmptyState />}

            {!error && awards.length > 0 && <AwardsList groupedAwards={groupedAwards} />}

            {loading && <LoadingState />}
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
