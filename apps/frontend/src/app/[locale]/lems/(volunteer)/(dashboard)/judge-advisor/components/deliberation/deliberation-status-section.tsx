'use client';

import { useMemo } from 'react';
import { Box, Stack } from '@mui/material';
import { MAX_PICKLIST_LIMIT, PICKLIST_LIMIT_MULTIPLIER } from '@lems/shared';
import { useJudgeAdvisor } from '../judge-advisor-context';
import { CategoryDeliberationCard, type Deliberation } from './category-deliberation-card';
import { FinalDeliberationCard, type FinalDeliberation } from './final-deliberation-card';

export function DeliberationStatusSection() {
  const { deliberations, finalDeliberation, sessions, loading } = useJudgeAdvisor();

  const categoriesWithStatuses = useMemo(() => {
    const categories = ['innovation_project', 'robot_design', 'core_values'];
    return categories.map(category => {
      const deliberation = deliberations.find(d => d.category === category);
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
    <Stack spacing={3}>
      {/* Category Deliberations */}
      <Box display="flex" flexWrap="wrap" gap={2}>
        {categoriesWithStatuses.map(({ category, deliberation }) => (
          <CategoryDeliberationCard
            key={category}
            category={category}
            deliberation={deliberation as Deliberation | undefined}
            desiredPicklistLength={desiredPicklistLength}
            loading={loading}
          />
        ))}
      </Box>

      {/* Final Deliberation */}
      {finalDeliberation && (
        <FinalDeliberationCard
          finalDeliberation={finalDeliberation as FinalDeliberation}
          loading={loading}
        />
      )}
    </Stack>
  );
}
