'use client';

import { useTranslations } from 'next-intl';
import { CardHeader, CardContent, Typography, useTheme, Paper } from '@mui/material';
import { ResponsiveComponent } from '@lems/shared';
import type { RoundGroup } from './utils';
import { DesktopScheduleTable } from './desktop-schedule/desktop-schedule-table';
import { MobileScheduleCards } from './mobile-schedule-cards';

interface RoundScheduleProps {
  roundGroup: RoundGroup;
}

export function RoundSchedule({ roundGroup }: RoundScheduleProps) {
  const t = useTranslations('pages.head-referee');
  const theme = useTheme();

  const { stage, round, matches, scoresheets } = roundGroup;

  const stageLabel = stage === 'PRACTICE' ? t('stage.practice') : t('stage.ranking');
  const title = `${stageLabel} - ${t('round')} ${round}`;

  return (
    <Paper
      elevation={2}
      sx={{
        backgroundColor: 'background.paper',
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      <CardHeader
        title={
          <Typography variant="h6" fontWeight={600} color="text.primary">
            {title}
          </Typography>
        }
        sx={{
          backgroundColor: 'grey.50',
          borderBottom: `1px solid ${theme.palette.divider}`,
          py: 2,
          px: 3
        }}
      />
      <CardContent
        sx={{
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          '&.MuiCardContent-root:last-child': { pb: 0 }
        }}
      >
        <ResponsiveComponent
          desktop={<DesktopScheduleTable matches={matches} scoresheets={scoresheets} />}
          mobile={<MobileScheduleCards matches={matches} scoresheets={scoresheets} />}
        />
      </CardContent>
    </Paper>
  );
}
