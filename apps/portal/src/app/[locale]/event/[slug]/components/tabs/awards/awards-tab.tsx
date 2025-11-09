'use client';

import useSWR from 'swr';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Typography, Paper, Box, Divider, Stack } from '@mui/material';
import { Award } from '@lems/types/api/portal';
import { useDivision } from '../../division-data-context';
import { AwardRow } from './award-row';

export const AwardsTab: React.FC = () => {
  const t = useTranslations('pages.event');

  const division = useDivision();

  const { data: awards } = useSWR<Award[]>(`/portal/divisions/${division.id}/awards`, {
    suspense: true
  });

  // Group awards by name, then sort by place
  const awardsByName = useMemo(() => {
    const result = (awards || []).reduce(
      (acc, award) => {
        if (!acc[award.name]) {
          acc[award.name] = [];
        }
        acc[award.name].push(award);
        return acc;
      },
      {} as Record<string, Award[]>
    );

    Object.keys(result).forEach(awardName => {
      result[awardName].sort((a, b) => a.place - b.place);
    });

    return result;
  }, [awards]);

  if (awards === null) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h2" gutterBottom>
          {t('quick-links.awards')}
        </Typography>
        <Box display="flex" alignItems="center" justifyContent="center" py={8}>
          <Typography variant="h6" color="text.secondary">
            {t('awards.no-data')}
          </Typography>
        </Box>
      </Paper>
    );
  }

  if (!awards) {
    return null; // Should be handled by suspense fallback
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h2" gutterBottom>
        {t('quick-links.awards')}
      </Typography>

      <Stack spacing={3} divider={<Divider />}>
        {Object.entries(awardsByName).map(([awardName, awardList]) => (
          <AwardRow key={awardName} awardName={awardName} awardList={awardList} />
        ))}
      </Stack>
    </Paper>
  );
};
