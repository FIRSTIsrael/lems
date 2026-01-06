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

export function Feedback({ team }: FeedbackProps) {
  const t = useTranslations('layouts.deliberation.compare');
  const { getCategory } = useJudgingCategoryTranslations();
  const { getFeedbackTitle } = useRubricsGeneralTranslations();
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

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'innovation-project':
        return '#1976d2'; // blue[500]
      case 'robot-design':
        return '#388e3c'; // green[500]
      case 'core-values':
        return '#d32f2f'; // red[500]
      default:
        return '#1976d2'; // blue[500]
    }
  };

  const getCategoryBgColor = (cat: string) => {
    switch (cat) {
      case 'innovation-project':
        return '#e3f2fd'; // blue[50]
      case 'robot-design':
        return '#e8f5e8'; // green[50]
      case 'core-values':
        return '#ffebee'; // red[50]
      default:
        return '#e3f2fd'; // blue[50]
    }
  };

  const hasAnyFeedback = Object.keys(feedbacksByCategory).length > 0;

  if (!hasAnyFeedback) {
    return null;
  }

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" fontWeight={600}>
        {t('feedback')}
      </Typography>

      {category ? (
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
            {getCategory(category as 'innovation-project' | 'robot-design' | 'core-values')}
          </Typography>

          <Stack spacing={1}>
            {Object.entries(feedbacksByCategory).map(([cat, feedback]) => (
              <Box key={cat}>
                <Stack spacing={1}>
                  {feedback.greatJob && (
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'black',
                          fontWeight: 700,
                          fontSize: '0.8rem'
                        }}
                      >
                        {getFeedbackTitle('greatJob')}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 0.5,
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word'
                        }}
                      >
                        {feedback.greatJob}
                      </Typography>
                    </Box>
                  )}
                  {feedback.thinkAbout && (
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'black',
                          fontWeight: 700,
                          fontSize: '0.8rem'
                        }}
                      >
                        {getFeedbackTitle('thinkAbout')}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 0.5,
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word'
                        }}
                      >
                        {feedback.thinkAbout}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Paper>
      ) : (
        <Grid container spacing={1}>
          {Object.entries(feedbacksByCategory).map(([cat, feedback]) => (
            <Grid size={4} key={cat}>
              <Paper
                sx={{
                  p: 1.5,
                  bgcolor: getCategoryBgColor(cat),
                  border: `2px solid ${getCategoryColor(cat)}`,
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
                    color: getCategoryColor(cat),
                    textAlign: 'center',
                    mb: 1,
                    display: 'block'
                  }}
                >
                  {feedback.categoryName}
                </Typography>

                <Stack spacing={1}>
                  {feedback.greatJob && (
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'black',
                          fontWeight: 700,
                          fontSize: '0.8rem'
                        }}
                      >
                        {getFeedbackTitle('greatJob')}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 0.5,
                          fontSize: '0.7rem',
                          lineHeight: 1.3,
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word'
                        }}
                      >
                        {feedback.greatJob}
                      </Typography>
                    </Box>
                  )}
                  {feedback.thinkAbout && (
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'black',
                          fontWeight: 700,
                          fontSize: '0.8rem'
                        }}
                      >
                        {getFeedbackTitle('thinkAbout')}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 0.5,
                          fontSize: '0.7rem',
                          lineHeight: 1.3,
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word'
                        }}
                      >
                        {feedback.thinkAbout}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
}
