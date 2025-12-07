'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Paper,
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  useTheme
} from '@mui/material';
import { getRubricColor } from '@lems/shared/rubrics/rubric-utils';
import { JudgingSessionAdvisor } from '../lead-judge.graphql';
import { RubricStatus } from '@lems/database';
import type { JudgingCategory } from '@lems/types/judging';
import { useJudgingCategoryTranslations } from '@lems/localization';

interface RubricStatusSummaryProps {
  sessions: JudgingSessionAdvisor[];
  category: string;
  loading?: boolean;
}

export const RubricStatusSummary: React.FC<RubricStatusSummaryProps> = ({
  sessions,
  category,
  loading = false
}) => {
  const t = useTranslations('pages.judge-advisor.summary');
  const { getCategory } = useJudgingCategoryTranslations();
  const theme = useTheme();

  const stats = useMemo(() => {
    const statuses = sessions
      .map(session => session.rubrics[category as keyof typeof session.rubrics]?.status || 'empty' as RubricStatus)
      .filter(Boolean);

    return {
      category,
      label: getCategory(category),
      empty: statuses.filter(s => s === 'empty').length,
      draft: statuses.filter(s => s === 'draft').length,
      inReview: statuses.filter(s => s === 'locked').length,
      completed: statuses.filter(s => s === 'completed').length,
      approved: statuses.filter(s => s === 'approved').length,
      total: statuses.length
    };
  }, [sessions, category, getCategory]);

  if (loading) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Stack spacing={2}>
          <Box sx={{ height: 20, bgcolor: 'action.disabledBackground', borderRadius: 1 }} />
          <Box
            sx={{
              flex: { xs: '1 1 100%', sm: '1 1 100%' },
              height: 200,
              bgcolor: 'action.disabledBackground',
              borderRadius: 1
            }}
          />
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        {t('title')}
      </Typography>

      <Box>
        {(() => {
          const color = getRubricColor(stats.category as JudgingCategory);

          return (
            <Card
              sx={{
                backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fafafa',
                borderLeft: `4px solid ${color}`
              }}
            >
              <CardContent>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: color
                  }}
                >
                  {stats.label}
                </Typography>

                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">
                      {t('status.empty')}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {stats.empty} / {stats.total}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">
                      {t('status.draft')}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {stats.draft} / {stats.total}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">
                      {t('status.completed')}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: stats.completed === stats.total ? '#4caf50' : 'inherit'
                      }}
                    >
                      {stats.completed} / {stats.total}
                    </Typography>
                  </Box>
                </Stack>

                <Box
                  sx={{
                    mt: 2,
                    height: 8,
                    backgroundColor: theme.palette.action.disabledBackground,
                    borderRadius: 1,
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%`,
                      backgroundColor: color,
                      transition: 'width 0.3s ease'
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          );
        })()}
      </Box>
    </Paper>
  );
};
