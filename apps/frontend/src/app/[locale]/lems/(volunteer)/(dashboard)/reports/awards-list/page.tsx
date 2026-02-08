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
    const sortedAwards = [...awards].sort((a, b) => a.index - b.index);

    const groups: Record<string, Award[]> = {};
    sortedAwards.forEach(award => {
      if (!groups[award.name]) {
        groups[award.name] = [];
      }
      groups[award.name].push(award);
    });

    // Convert to ordered array ensuring advancement comes before champions
    const orderedGroups: Array<[string, Award[]]> = [];
    const seenNames = new Set<string>();

    for (const award of sortedAwards) {
      if (!seenNames.has(award.name)) {
        seenNames.add(award.name);
        orderedGroups.push([award.name, groups[award.name]]);
      }
    }

    // Find advancement group and ensure it's immediately before champions
    let advancementGroupEntry: [string, Award[]] | null = null;
    const nonAdvancementGroups: Array<[string, Award[]]> = [];

    orderedGroups.forEach(([name, groupAwards]) => {
      if (name === 'advancement') {
        advancementGroupEntry = [name, groupAwards];
      } else {
        nonAdvancementGroups.push([name, groupAwards]);
      }
    });

    // Place advancement before champions if both exist
    const finalGroups: Array<[string, Award[]]> = [];
    const championsGroup = nonAdvancementGroups.find(([name]) => name === 'champions');

    if (advancementGroupEntry && championsGroup) {
      nonAdvancementGroups.forEach(([name, groupAwards]) => {
        if (name === 'champions' && advancementGroupEntry) {
          finalGroups.push(advancementGroupEntry);
          finalGroups.push([name, groupAwards]);
        } else if (name !== 'champions') {
          finalGroups.push([name, groupAwards]);
        }
      });
    } else {
      finalGroups.push(...orderedGroups);
    }

    return Object.fromEntries(finalGroups);
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
