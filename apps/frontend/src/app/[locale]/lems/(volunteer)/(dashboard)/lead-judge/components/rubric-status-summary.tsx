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
  useTheme,
  LinearProgress
} from '@mui/material';
import { getRubricColor } from '@lems/shared/rubrics/rubric-utils';
import type { JudgingCategory } from '@lems/types/judging';
import { useJudgingCategoryTranslations } from '@lems/localization';
import { useLeadJudge } from './lead-judge-context';
import { getRubricStatusStats } from './utils';
import { SessionFilters } from './session-filters';
import { LeadJudgeDeliberationCard } from './lead-judge-deliberation-card';
import { RubricStatusGlossary } from './rubric-status-glossary';

interface RubricStatusSummaryProps {
  teamFilter: string;
  setTeamFilter: (value: string) => void;
  statusFilter: string[];
  setStatusFilter: (value: string[]) => void;
}

export const RubricStatusSummary: React.FC<RubricStatusSummaryProps> = ({
  teamFilter,
  setTeamFilter,
  statusFilter,
  setStatusFilter
}) => {
  const t = useTranslations('pages.lead-judge.summary');
  const { getCategory } = useJudgingCategoryTranslations();
  const theme = useTheme();

  const { sessions, category, loading } = useLeadJudge();
  const color = getRubricColor(category as JudgingCategory);

  const stats = useMemo(
    () => getRubricStatusStats(sessions, category as JudgingCategory),
    [sessions, category]
  );

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
    <Paper
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <RubricStatusGlossary />
      </Box>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          gap: 2
        }}
      >
        <Card
          sx={{
            backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fafafa',
            borderLeft: `4px solid ${color}`
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
              {getCategory(category as JudgingCategory)} ({stats.total})
            </Typography>

            <Stack spacing={0.75}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  {t('status.empty')}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {stats.empty}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  {t('status.draft')}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {stats.draft}
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
                    color:
                      stats.completed + stats.locked + stats.approved === stats.total
                        ? '#4caf50'
                        : 'inherit'
                  }}
                >
                  {stats.completed + stats.locked + stats.approved}
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mt: 1.5 }}
            >
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                {t('status.approved')}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, mt: 1 }}>
                {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
              </Typography>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={stats.total > 0 ? (stats.approved / stats.total) * 100 : 0}
              sx={{
                height: 10,
                mt: 1,
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
        <SessionFilters
          teamFilter={teamFilter}
          setTeamFilter={setTeamFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
        <LeadJudgeDeliberationCard />
      </Box>
    </Paper>
  );
};
