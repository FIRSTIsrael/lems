'use client';

import { useTranslations } from 'next-intl';
import { Box, Stack, Button } from '@mui/material';
import { Add } from '@mui/icons-material';

interface CalendarHeaderProps {
  onAddPracticeRound: () => void;
  onAddRankingRound: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  onAddPracticeRound,
  onAddRankingRound
}) => {
  const t = useTranslations('pages.events.schedule.calendar');

  return (
    <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" spacing={2}>
        <Button size="small" variant="outlined" startIcon={<Add />} onClick={onAddPracticeRound}>
          {t('field.add-practice-round')}
        </Button>
        <Button size="small" variant="outlined" startIcon={<Add />} onClick={onAddRankingRound}>
          {t('field.add-ranking-round')}
        </Button>
      </Stack>
    </Box>
  );
};
