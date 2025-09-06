'use client';

import { useTranslations } from 'next-intl';
import { Box, Typography } from '@mui/material';

export const TeamSwapper: React.FC = () => {
  const t = useTranslations('pages.events.schedule.teamSwap');

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
        {t('placeholder')}
      </Typography>
    </Box>
  );
};
