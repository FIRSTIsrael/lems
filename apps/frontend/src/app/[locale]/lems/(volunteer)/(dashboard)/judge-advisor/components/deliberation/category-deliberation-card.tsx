'use client';

import dayjs from 'dayjs';
import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { getRubricColor } from '@lems/shared/rubrics/rubric-utils';
import { JudgingCategory } from '@lems/types/judging';
import {
  useJudgingCategoryTranslations,
  useJudgingDeliberationTranslations
} from '@lems/localization';
import { CategoryDeliberationButton } from './category-deliberation-button';

export interface Deliberation {
  category: string;
  status: string;
  picklist: unknown[];
  startTime?: string;
}

interface CategoryDeliberationCardProps {
  category: JudgingCategory;
  deliberation: Deliberation | undefined;
  desiredPicklistLength: number;
}

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

export function CategoryDeliberationCard({
  category,
  deliberation,
  desiredPicklistLength
}: CategoryDeliberationCardProps) {
  const t = useTranslations('pages.judge-advisor.awards.deliberation');
  const { getCategory } = useJudgingCategoryTranslations();
  const { getStatus } = useJudgingDeliberationTranslations();

  const color = getRubricColor(category);
  const label = getCategory(category as JudgingCategory);

  if (!deliberation) {
    return null;
  }

  return (
    <Box
      sx={{
        flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 11px)' }
      }}
    >
      <Card
        sx={{
          height: '100%',
          backgroundColor: '#fafafa',
          borderLeft: `4px solid ${color}`,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" fontWeight={600} mb={2} color={color}>
            {label}
          </Typography>

          <Stack
            spacing={2}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                {t('status')}
              </Typography>
              <Chip
                label={getStatus(deliberation.status)}
                color={getDeliberationStatusColor(deliberation.status)}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                {t('start-time')}
              </Typography>
              <Typography variant="body2" fontWeight={500} fontFamily="monospace">
                {deliberation.startTime ? dayjs(deliberation.startTime).format('HH:mm') : '—'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                {t('picklist')}
              </Typography>
              {deliberation ? (
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {deliberation.picklist.length} / {desiredPicklistLength}
                </Typography>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  —
                </Typography>
              )}
            </Box>
          </Stack>
        </CardContent>

        <CardContent sx={{ pt: 0 }}>
          <CategoryDeliberationButton category={category} />
        </CardContent>
      </Card>
    </Box>
  );
}
