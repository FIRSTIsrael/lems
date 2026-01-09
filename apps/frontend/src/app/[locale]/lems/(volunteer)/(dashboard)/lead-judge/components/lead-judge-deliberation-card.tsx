'use client';

import dayjs from 'dayjs';
import { Box, Card, CardContent, Chip, Stack, Typography, useTheme, Divider } from '@mui/material';
import { useTranslations } from 'next-intl';
import { getRubricColor } from '@lems/shared/rubrics/rubric-utils';
import { JudgingCategory } from '@lems/types/judging';
import { useJudgingDeliberationTranslations } from '@lems/localization';
import { useLeadJudge } from './lead-judge-context';
import { LeadJudgeDeliberationButton } from './lead-judge-deliberation-button';

function getDeliberationStatusColor(
  status: string
): 'default' | 'primary' | 'success' | 'warning' | 'error' {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in-progress':
      return 'primary';
    case 'not-started':
      return 'default';
    default:
      return 'default';
  }
}

export function LeadJudgeDeliberationCard() {
  const t = useTranslations('pages.lead-judge.deliberation');
  const { getStatus } = useJudgingDeliberationTranslations();
  const theme = useTheme();

  const { category, deliberation, desiredPicklistLength, sessionLength } = useLeadJudge();

  if (!deliberation) {
    return null;
  }

  const color = getRubricColor(category as JudgingCategory);

  return (
    <>
      <Divider sx={{ my: 0.5 }} />
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
            {t('deliberation')}
          </Typography>

          <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="textSecondary">
                {t('status')}
              </Typography>
              <Chip
                label={getStatus(deliberation.status)}
                color={getDeliberationStatusColor(deliberation.status)}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="textSecondary">
                {t('start-time')}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {deliberation.startTime ? dayjs(deliberation.startTime).format('HH:mm') : '—'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="textSecondary">
                {t('picklist')}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {deliberation.picklist.length} / {desiredPicklistLength}
              </Typography>
            </Box>
          </Stack>
          <LeadJudgeDeliberationButton sessionLength={sessionLength} />
        </CardContent>
      </Card>
    </>
  );
}
