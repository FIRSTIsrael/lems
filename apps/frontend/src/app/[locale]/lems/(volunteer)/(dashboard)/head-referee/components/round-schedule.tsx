'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  CardHeader,
  CardContent,
  Typography,
  Chip,
  useMediaQuery,
  useTheme,
  Paper
} from '@mui/material';
import type { RoundGroup } from './utils';
import { DesktopScheduleTable } from './desktop-schedule-table';
import { MobileScheduleCards } from './mobile-schedule-cards';

interface RoundScheduleProps {
  roundGroup: RoundGroup;
}

export function RoundSchedule({ roundGroup }: RoundScheduleProps) {
  const t = useTranslations('pages.head-referee');
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg')); // 1200px
  const [expanded, setExpanded] = useState(true);

  const { stage, round, matches, scoresheets, escalatedCount } = roundGroup;

  const stageLabel = stage === 'PRACTICE' ? t('stage.practice') : t('stage.ranking');
  const title = `${stageLabel} - ${t('round')} ${round}`;

  return (
    <Paper
      sx={{
        bgcolor: 'white',
        border: `2px solid transparent`,
        borderRadius: 1.5,
        overflow: 'hidden'
      }}
    >
      <CardHeader
        title={
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
        }
        action={
          <>
            {escalatedCount > 0 && (
              <Chip
                label={t('escalated-count', { count: escalatedCount })}
                color="warning"
                size="small"
                sx={{ mr: 1 }}
              />
            )}
          </>
        }
        sx={{
          bgcolor: 'grey.50',
          borderBottom: `1px solid ${theme.palette.divider}`,
          py: 1.5
        }}
      />
      <CardContent sx={{ p: 0 }}>
        {isLargeScreen ? (
          <DesktopScheduleTable matches={matches} scoresheets={scoresheets} />
        ) : (
          <MobileScheduleCards matches={matches} scoresheets={scoresheets} />
        )}
      </CardContent>
    </Paper>
  );
}
