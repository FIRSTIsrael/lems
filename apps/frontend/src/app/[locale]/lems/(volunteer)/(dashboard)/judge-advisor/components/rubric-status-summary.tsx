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
import { JudgingSessionAdvisor } from '../judge-advisor.graphql';
import { RubricStatus } from '@lems/database';
import { JUDGING_CATEGORIES } from '@lems/types/judging';
import { useJudgingCategoryTranslations } from '@lems/localization';

interface RubricStatusSummaryProps {
  sessions: JudgingSessionAdvisor[];
  loading?: boolean;
}

export const RubricStatusSummary: React.FC<RubricStatusSummaryProps> = ({
  sessions,
  loading = false
}) => {
  const t = useTranslations('pages.judge-advisor.summary');
  const { getCategory } = useJudgingCategoryTranslations();
  const theme = useTheme();

  const stats = useMemo(() => {
    const categories = JUDGING_CATEGORIES;

    return categories.map(category => {
      const statuses = sessions
        .map(session => session.rubrics[category]?.status || 'empty' as RubricStatus)
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
    });
  }, [sessions, t]);

  if (loading) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Stack spacing={2}>
          <Box sx={{ height: 20, bgcolor: 'action.disabledBackground', borderRadius: 1 }} />
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2
            }}
          >
            {[1, 2, 3].map(i => (
              <Box
                key={i}
                sx={{
                  flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 11px)' },
                  height: 200,
                  bgcolor: 'action.disabledBackground',
                  borderRadius: 1
                }}
              />
            ))}
          </Box>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        {t('title')}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        {stats.map(stat => {
          const color = getRubricColor(stat.category);

          return (
            <Box
              key={stat.category}
              sx={{
                flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 11px)' }
              }}
            >
              <Card
                sx={{
                  height: '100%',
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
                    {stat.label}
                  </Typography>

                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">
                        {t('status.empty')}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {stat.empty} / {stat.total}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">
                        {t('status.draft')}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {stat.draft} / {stat.total}
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
                          color: stat.completed === stat.total ? '#4caf50' : 'inherit'
                        }}
                      >
                        {stat.completed} / {stat.total}
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
                        width: `${stat.total > 0 ? (stat.completed / stat.total) * 100 : 0}%`,
                        backgroundColor: color,
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};
