'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  useTheme,
  LinearProgress,
  Grid
} from '@mui/material';
import { getRubricColor } from '@lems/shared/rubrics/rubric-utils';
import { JUDGING_CATEGORIES, JudgingCategory } from '@lems/types/judging';
import { useJudgingCategoryTranslations } from '@lems/localization';
import { range } from '@lems/shared/utils';
import { getRubricStatusStats } from './utils';
import { useJudgeAdvisor } from './judge-advisor-context';

export const RubricStatusSummary = () => {
  const { sessions, loading } = useJudgeAdvisor();
  const t = useTranslations('pages.judge-advisor.summary');
  const { getCategory } = useJudgingCategoryTranslations();
  const theme = useTheme();

  const stats = useMemo(() => getRubricStatusStats(sessions), [sessions]);

  if (loading) {
    return (
      <Stack spacing={2}>
        <Box display="flex" flexWrap="wrap" gap={2}>
          {range(JUDGING_CATEGORIES.length).map(i => (
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
    );
  }

  return (
    <Box display="flex" flexWrap="wrap" gap={2}>
      {Object.entries(stats).map(([category, stat]) => {
        const color = getRubricColor(category as JudgingCategory);

        const { empty, draft, completed, locked, approved, total } = stat;
        const label = `${getCategory(category as JudgingCategory)} (${total})`;

        return (
          <Box
            key={category}
            sx={{
              flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 11px)' }
            }}
          >
            <Card
              sx={{
                height: '100%',
                backgroundColor: '#fafafa',
                borderLeft: `4px solid ${color}`
              }}
            >
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} mb={2} color={color}>
                  {label}
                </Typography>

                <Grid container spacing={1}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box
                      display="flex"
                      justifyContent={{ xs: 'space-between', md: 'flex-start' }}
                      gap={2}
                    >
                      <Typography variant="body2" color="textSecondary">
                        {t('status.empty')}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {empty}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box
                      display="flex"
                      justifyContent={{ xs: 'space-between', md: 'flex-start' }}
                      gap={2}
                    >
                      <Typography variant="body2" color="textSecondary">
                        {t('status.draft')}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {draft}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box
                      display="flex"
                      justifyContent={{ xs: 'space-between', md: 'flex-start' }}
                      gap={2}
                    >
                      <Typography variant="body2" color="textSecondary">
                        {t('status.completed')}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                          color: completed + locked + approved === total ? '#4caf50' : 'inherit'
                        }}
                      >
                        {completed + locked + approved}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Stack direction="row" justifyContent="space-between" mt={2}>
                  <Typography variant="body2" color="textSecondary" mt={2} mb={1}>
                    {t('status.approved')}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} mt={2} mb={1}>
                    {total > 0 ? Math.round((approved / total) * 100) : 0}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={total > 0 ? (approved / total) * 100 : 0}
                  sx={{
                    height: 12,
                    borderRadius: 1,
                    backgroundColor: theme.palette.action.disabledBackground,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: color,
                      transition: 'width 0.3s ease'
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Box>
        );
      })}
    </Box>
  );
};
