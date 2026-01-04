'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Stack, Typography, Box, Grid } from '@mui/material';
import { useCompareContext } from '../compare-context';
import type { Team } from '../graphql/types';

interface FeedbackProps {
  team: Team;
}

export function Feedback({ team }: FeedbackProps) {
  const t = useTranslations('layouts.deliberation.compare');
  const tRubric = useTranslations('pages.judge.schedule.rubric-labels');
  const { category } = useCompareContext();

  const feedbacks = useMemo(() => {
    const result: Array<{
      category: string;
      greatJob?: string;
      thinkAbout?: string;
    }> = [];

    const categories = category
      ? [category]
      : ['innovation-project', 'robot-design', 'core-values'];

    categories.forEach(cat => {
      const rubricKey = cat.replace('-', '_') as keyof typeof team.rubrics;
      const rubric = team.rubrics[rubricKey];

      if (rubric?.data?.feedback) {
        const { greatJob, thinkAbout } = rubric.data.feedback;
        if (greatJob || thinkAbout) {
          result.push({
            category: tRubric(cat as 'innovation-project' | 'robot-design' | 'core-values'),
            greatJob,
            thinkAbout
          });
        }
      }
    });

    return result;
  }, [team, category, tRubric]);

  if (feedbacks.length === 0) {
    return null;
  }

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" fontWeight={600}>
        {t('feedback')}
      </Typography>
      {feedbacks.map((feedback, index) => (
        <Box key={index}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {feedback.category}
          </Typography>
          <Grid container spacing={1} sx={{ mt: 0.5 }}>
            {feedback.greatJob && (
              <Grid size={12}>
                <Typography variant="caption" color="success.main" fontWeight={600}>
                  {t('great-job')}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {feedback.greatJob}
                </Typography>
              </Grid>
            )}
            {feedback.thinkAbout && (
              <Grid size={12}>
                <Typography variant="caption" color="warning.main" fontWeight={600}>
                  {t('think-about')}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {feedback.thinkAbout}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      ))}
    </Stack>
  );
}
