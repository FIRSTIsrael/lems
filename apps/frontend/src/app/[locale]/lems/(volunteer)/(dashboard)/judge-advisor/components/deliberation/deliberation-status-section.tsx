'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { MAX_PICKLIST_LIMIT, PICKLIST_LIMIT_MULTIPLIER } from '@lems/shared';
import { underscoresToHyphens } from '@lems/shared/utils';
import { JudgingCategory } from '@lems/database';
import { useJudgeAdvisor } from '../judge-advisor-context';
import { CategoryDeliberationCard, type Deliberation } from './category-deliberation-card';
import { FinalDeliberationCard } from './final-deliberation-card';

export function DeliberationStatusSection() {
  const { deliberations, sessions } = useJudgeAdvisor();
  const t = useTranslations('pages.judge-advisor.awards');

  const categoriesWithStatuses = useMemo(() => {
    const categories = ['innovation_project', 'robot_design', 'core_values'] as const;
    return categories.map(category => {
      const deliberation = deliberations[category];
      return {
        category,
        deliberation
      };
    });
  }, [deliberations]);

  const desiredPicklistLength = useMemo(() => {
    const teamCount = sessions.length;
    return Math.min(MAX_PICKLIST_LIMIT, Math.ceil(teamCount * PICKLIST_LIMIT_MULTIPLIER));
  }, [sessions.length]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('deliberations')}
        </Typography>
        <Stack spacing={3}>
          <Box display="flex" flexWrap="wrap" gap={2}>
            {categoriesWithStatuses.map(({ category, deliberation }) => (
              <CategoryDeliberationCard
                key={category}
                category={underscoresToHyphens(category) as JudgingCategory}
                deliberation={deliberation as Deliberation | undefined}
                desiredPicklistLength={desiredPicklistLength}
              />
            ))}
          </Box>

          <FinalDeliberationCard />
        </Stack>
      </CardContent>
    </Card>
  );
}
