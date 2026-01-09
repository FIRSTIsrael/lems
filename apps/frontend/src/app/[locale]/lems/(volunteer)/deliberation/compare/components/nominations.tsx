'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Stack, Typography, Box } from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import { useAwardTranslations } from '@lems/localization';
import { useCompareContext } from '../compare-context';
import type { Team } from '../graphql/types';

interface NominationsProps {
  team: Team;
}

const CORE_VALUES_AWARDS = [
  'breakthrough',
  'rising-all-star',
  'judges-award',
  'motivate',
  'impact'
] as const;

export function Nominations({ team }: NominationsProps) {
  const t = useTranslations('layouts.deliberation.compare');
  const { getName: getAwardName } = useAwardTranslations();
  const { category } = useCompareContext();

  const nominations = useMemo(() => {
    const cvRubric = team.rubrics.core_values;
    if (!cvRubric?.data?.awards) return {};
    return cvRubric.data.awards;
  }, [team.rubrics.core_values]);

  if (category && category !== 'core-values') {
    return null;
  }

  const hasAnyNominations = Object.values(nominations).some(Boolean);

  if (!hasAnyNominations) {
    return null;
  }

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" fontWeight={600}>
        {t('nominations')}
      </Typography>
      <Stack spacing={0.5}>
        {CORE_VALUES_AWARDS.map(award => {
          const isNominated = nominations[award];
          if (!isNominated) return null;

          return (
            <Box
              key={award}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              {isNominated ? (
                <Check sx={{ fontSize: 18, color: 'success.main' }} />
              ) : (
                <Close sx={{ fontSize: 18, color: 'error.main' }} />
              )}
              <Typography variant="body2">{getAwardName(award)}</Typography>
            </Box>
          );
        })}
      </Stack>
    </Stack>
  );
}
