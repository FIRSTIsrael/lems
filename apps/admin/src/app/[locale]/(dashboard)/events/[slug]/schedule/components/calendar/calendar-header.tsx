'use client';

import { useTranslations } from 'next-intl';
import { Box, Stack, Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useCalendar } from './calendar-context';

export const CalendarHeader: React.FC = () => {
  const t = useTranslations('pages.events.schedule.calendar');

  const { addPracticeRound, addRankingRound } = useCalendar();

  return (
    <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" spacing={2}>
        <Button size="small" variant="outlined" startIcon={<Add />} onClick={addPracticeRound}>
          {t('field.add-practice-round')}
        </Button>
        <Button size="small" variant="outlined" startIcon={<Add />} onClick={addRankingRound}>
          {t('field.add-ranking-round')}
        </Button>
      </Stack>
    </Box>
  );
};
