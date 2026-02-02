'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Accordion, AccordionSummary, AccordionDetails, Typography, useTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ResponsiveComponent } from '@lems/shared';
import type { RoundGroup } from './utils';
import { DesktopScheduleTable } from './desktop-schedule/desktop-schedule-table';
import { MobileScheduleCards } from './mobile-schedule-cards';

interface RoundScheduleProps {
  roundGroup: RoundGroup;
  defaultExpanded?: boolean;
}

export function RoundSchedule({ roundGroup, defaultExpanded = true }: RoundScheduleProps) {
  const t = useTranslations('pages.head-referee');
  const theme = useTheme();
  const [expanded, setExpanded] = useState(defaultExpanded);

  const { stage, round, matches, scoresheets } = roundGroup;

  const stageLabel = stage === 'PRACTICE' ? t('stage.practice') : t('stage.ranking');
  const title = `${stageLabel} - ${t('round')} ${round}`;

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExpanded) => setExpanded(isExpanded)}
      elevation={2}
      sx={{
        backgroundColor: 'background.paper',
        borderRadius: 2,
        '&:before': {
          display: 'none'
        },
        '&.Mui-expanded': {
          margin: 0
        }
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: 'grey.50',
          borderBottom: expanded ? `1px solid ${theme.palette.divider}` : 'none',
          py: 1,
          px: 3,
          '&.Mui-expanded': {
            minHeight: 56
          },
          '& .MuiAccordionSummary-content': {
            margin: '12px 0',
            '&.Mui-expanded': {
              margin: '12px 0'
            }
          }
        }}
      >
        <Typography variant="h6" fontWeight={600} color="text.primary">
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          p: 0,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <ResponsiveComponent
          desktop={<DesktopScheduleTable matches={matches} scoresheets={scoresheets} />}
          mobile={<MobileScheduleCards matches={matches} scoresheets={scoresheets} />}
        />
      </AccordionDetails>
    </Accordion>
  );
}
