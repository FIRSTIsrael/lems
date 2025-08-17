'use client';

import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

interface EventTeamsSplitView {
  eventId: string;
}

export const EventTeamsSplitView: React.FC<EventTeamsSplitView> = ({ eventId }) => {
  const t = useTranslations('pages.events.teams.split');

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        border: '2px dashed',
        borderColor: 'divider',
        borderRadius: 2,
        backgroundColor: 'grey.50'
      }}
    >
      <Typography variant="h6" color="text.secondary">
        {t('placeholder', { eventId })}
      </Typography>
    </Box>
  );
};
