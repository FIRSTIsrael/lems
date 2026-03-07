'use client';

import { useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Paper, Typography, Stack, Box } from '@mui/material';
import { EmojiEvents, LockRounded } from '@mui/icons-material';
import type { Award } from '../graphql/types';
import { useMc } from './mc-context';
import { AwardPage } from './award-page';
import { NavButtons } from './nav-buttons';

interface AwardGroup {
  name: string;
  index: number;
  awards: Award[];
  showPlaces: boolean;
}

export const AwardsView: React.FC = () => {
  const t = useTranslations('pages.mc.awards');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { awardsAssigned, awards } = useMc();

  // Group awards by name and sort by index
  const pages = useMemo<AwardGroup[]>(() => {
    // Filter out awards with no winner
    const validAwards = awards.filter(award => award.winner !== null && award.winner !== undefined);

    // Group by award name
    const grouped = new Map<string, Award[]>();
    validAwards.forEach(award => {
      const group = grouped.get(award.name) || [];
      group.push(award);
      grouped.set(award.name, group);
    });

    // Create award groups sorted by the first occurrence index
    const awardGroups: AwardGroup[] = [];
    const seenNames = new Set<string>();

    // Sort awards by index to determine group order
    const sortedAwards = [...validAwards].sort((a, b) => a.index - b.index);

    let advancementGroup: AwardGroup | null = null;

    sortedAwards.forEach(award => {
      if (!seenNames.has(award.name)) {
        seenNames.add(award.name);
        const group: AwardGroup = {
          name: award.name,
          index: award.index,
          awards: grouped.get(award.name) || [],
          showPlaces: award.showPlaces
        };

        // Hardcode advancement awards (index -1)
        // Store them separately to place before champions
        if (award.index === -1) {
          advancementGroup = group;
        } else {
          awardGroups.push(group);
        }
      }
    });

    // Place advancement awards immediately before champions
    if (advancementGroup) {
      const championsIndex = awardGroups.findIndex(g => g.name === 'champions');
      if (championsIndex !== -1) {
        awardGroups.splice(championsIndex, 0, advancementGroup);
      } else {
        throw new Error('Champions award group not found while inserting advancement awards');
      }
    }

    return awardGroups;
  }, [awards]);

  // Get current page index from URL
  const currentIndex = useMemo(() => {
    const index = searchParams.get('awardIndex');
    const parsed = index ? parseInt(index, 10) : 0;
    return Math.max(0, Math.min(parsed, pages.length - 1));
  }, [searchParams, pages.length]);

  const currentPage = pages[currentIndex];

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('awardIndex', String(currentIndex - 1));
      router.push(`?${newSearchParams.toString()}`);
    }
  }, [currentIndex, searchParams, router]);

  const handleNext = useCallback(() => {
    if (currentIndex < pages.length - 1) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('awardIndex', String(currentIndex + 1));
      router.push(`?${newSearchParams.toString()}`);
    }
  }, [currentIndex, pages.length, searchParams, router]);

  if (!awardsAssigned) {
    return (
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          bgcolor: 'error.lighter',
          border: '2px solid',
          borderColor: 'error.main'
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Box sx={{ opacity: 0.6, color: 'error.main' }}>
            <LockRounded sx={{ fontSize: 80 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
            {t('blocked.title')}
          </Typography>
          <Typography variant="body2" sx={{ maxWidth: 600, color: 'error.main' }}>
            {t('blocked.description')}
          </Typography>
        </Stack>
      </Paper>
    );
  }

  if (pages.length === 0) {
    return (
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Box sx={{ opacity: 0.3 }}>
            <EmojiEvents sx={{ fontSize: 80 }} />
          </Box>
          <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 600 }}>
            {t('title')}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 600 }}>
            {t('description')}
          </Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 4 },
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        width: '100%'
      }}
    >
      {currentPage && <AwardPage awardGroup={currentPage} />}

      <NavButtons
        current={currentIndex}
        total={pages.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
    </Paper>
  );
};
