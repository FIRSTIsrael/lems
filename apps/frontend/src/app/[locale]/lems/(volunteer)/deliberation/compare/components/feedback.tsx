'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRubricsGeneralTranslations, useJudgingCategoryTranslations } from '@lems/localization';
import { Stack, Typography, Box, Grid, Paper } from '@mui/material';
import { useCompareContext } from '../compare-context';
import type { Team } from '../graphql/types';

interface FeedbackProps {
  team: Team;
}

function FeedbackItem({
  type,
  content,
  compact = false
}: {
  type: 'greatJob' | 'thinkAbout';
  content: string;
  compact?: boolean;
}) {
  const { getFeedbackTitle } = useRubricsGeneralTranslations();

  return (
    <Box>
      <Typography
        variant="caption"
        sx={{
          color: 'black',
          fontWeight: 700,
          fontSize: '0.8rem'
        }}
      >
        {getFeedbackTitle(type)}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          mt: 0.5,
          ...(compact && {
            fontSize: '0.7rem',
            lineHeight: 1.3
          }),
          wordWrap: 'break-word',
          overflowWrap: 'break-word'
        }}
      >
        {content}
      </Typography>
    </Box>
  );
}

function CategoryFeedbackCard({
  category,
  feedback,
  compact = false
}: {
  category: string;
  feedback: { categoryName: string; greatJob?: string; thinkAbout?: string };
  compact?: boolean;
}) {
  const categoryColors = {
    'innovation-project': { main: '#1976d2', bg: '#e3f2fd' },
    'robot-design': { main: '#388e3c', bg: '#e8f5e8' },
    'core-values': { main: '#d32f2f', bg: '#ffebee' }
  } as const;

  const getCategoryColor = (cat: string) =>
    categoryColors[cat as keyof typeof categoryColors]?.main ||
    categoryColors['innovation-project'].main;

  const getCategoryBgColor = (cat: string) =>
    categoryColors[cat as keyof typeof categoryColors]?.bg ||
    categoryColors['innovation-project'].bg;

  return (
    <Paper
      sx={{
        p: 1.5,
        bgcolor: getCategoryBgColor(category),
        border: `2px solid ${getCategoryColor(category)}`,
        borderRadius: 2,
        height: 180,
        overflowY: 'auto'
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: getCategoryColor(category),
          textAlign: 'center',
          mb: 1,
          display: 'block'
        }}
      >
        {feedback.categoryName}
      </Typography>

      <Stack spacing={1}>
        {feedback.greatJob && (
          <FeedbackItem type="greatJob" content={feedback.greatJob} compact={compact} />
        )}
        {feedback.thinkAbout && (
          <FeedbackItem type="thinkAbout" content={feedback.thinkAbout} compact={compact} />
        )}
      </Stack>
    </Paper>
  );
}

export function Feedback({ team }: FeedbackProps) {
  const t = useTranslations('layouts.deliberation.compare');
  const { getCategory } = useJudgingCategoryTranslations();
  const { category } = useCompareContext();

  const feedbacksByCategory = useMemo(() => {
    const categories = category
      ? [category]
      : ['innovation-project', 'robot-design', 'core-values'];

    const result: Record<
      string,
      {
        categoryName: string;
        greatJob?: string;
        thinkAbout?: string;
      }
    > = {};

    categories.forEach(cat => {
      const rubricKey = cat.replace('-', '_') as keyof typeof team.rubrics;
      const rubric = team.rubrics[rubricKey];

      if (rubric?.data?.feedback) {
        const { greatJob, thinkAbout } = rubric.data.feedback;
        if (greatJob || thinkAbout) {
          result[cat] = {
            categoryName: getCategory(cat as 'innovation-project' | 'robot-design' | 'core-values'),
            greatJob,
            thinkAbout
          };
        }
      }
    });

    return result;
  }, [team, category, getCategory]);

  if (Object.keys(feedbacksByCategory).length === 0) {
    return null;
  }

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" fontWeight={600}>
        {t('feedback')}
      </Typography>

      {category ? (
        Object.entries(feedbacksByCategory).map(([cat, feedback]) => (
          <CategoryFeedbackCard key={cat} category={cat} feedback={feedback} />
        ))
      ) : (
        <Grid container spacing={1}>
          {Object.entries(feedbacksByCategory).map(([cat, feedback]) => (
            <Grid size={4} key={cat}>
              <CategoryFeedbackCard category={cat} feedback={feedback} compact />
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
}
