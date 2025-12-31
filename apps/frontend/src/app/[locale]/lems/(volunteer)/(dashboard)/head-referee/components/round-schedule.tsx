'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardHeader,
  CardContent,
  Collapse,
  IconButton,
  Typography,
  Chip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
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
    <Card>
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
            <IconButton onClick={() => setExpanded(!expanded)} size="small">
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </>
        }
        sx={{ borderBottom: `3px solid ${stage === 'PRACTICE' ? '#3b82f6' : '#ef4444'}` }}
      />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          {isLargeScreen ? (
            <DesktopScheduleTable matches={matches} scoresheets={scoresheets} />
          ) : (
            <MobileScheduleCards matches={matches} scoresheets={scoresheets} />
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
}
