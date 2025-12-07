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
import { SessionFilters } from './session-filters';

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
  const t = useTranslations('pages.lead-judge.summary');
  const { getCategory } = useJudgingCategoryTranslations();
  const theme = useTheme();
  const color = getRubricColor(category as JudgingCategory);
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
    <Paper sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '0.95rem' }}>
        {t('title')}
      </Typography>

      <Box 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'flex-start',
          gap: 2
          }}>
        <Card
          sx={{
            backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fafafa',
            borderLeft: `4px solid ${color}`,
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: 1.5,
                color: color,
                fontSize: '0.9rem'
              }}
            >
              {stats.label}
            </Typography>

            <Stack spacing={0.75}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  {t('status.empty')}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {stats.empty} / {stats.total}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  {t('status.draft')}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {stats.draft} / {stats.total}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  {t('status.completed')}
                </Typography>
                <Typography
                  variant="caption"
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
                mt: 1.5,
                height: 6,
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
        <SessionFilters sessions={sessions} />
      </Box>
    </Paper>
  );
};
