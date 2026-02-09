'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Stack, Container, Box, Typography } from '@mui/material';
import { PageHeader } from '../../components/page-header';
import { useEvent } from '../../../components/event-context';
import { usePageData } from '../../../hooks/use-page-data';
import { GET_DIVISION_AWARDS, parseDivisionAwards, Award } from './graphql';
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
    // Group awards by name, sorted by index
    const groups: Record<string, Award[]> = {};
    [...awards]
      .sort((a, b) => a.index - b.index)
      .forEach(award => {
        if (!groups[award.name]) {
          groups[award.name] = [];
        }
        groups[award.name].push(award);
      });

    // Create ordered entries preserving sort order
    const entries = Object.entries(groups);
    const advancementEntry = entries.find(([name]) => name === 'advancement');

    if (!advancementEntry) return groups;

    // Remove advancement and insert before champions
    const filtered = entries.filter(([name]) => name !== 'advancement');
    const championsIdx = filtered.findIndex(([name]) => name === 'champions');

    if (championsIdx !== -1) {
      filtered.splice(championsIdx, 0, advancementEntry);
    }

    return Object.fromEntries(filtered);
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
