'use client';

import { useContext } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useTranslations } from 'next-intl';
import { MissionContext } from './mission-context';

export const PrintScoreSummary = () => {
  const t = useTranslations('pages.tools.scorer');
  const { points } = useContext(MissionContext);

  if (!points) return null;

  return (
    <Box
      sx={{
        display: 'none',
        '@media print': {
          display: 'block',
          marginTop: 4,
          pageBreakBefore: 'avoid'
        }
      }}
    >
      <Paper
        elevation={0}
        sx={{
          padding: 3,
          border: '3px solid #1976d2',
          borderRadius: 2,
          backgroundColor: '#f8f9fa',
          textAlign: 'center',
          '@media print': {
            border: '3px solid #1976d2 !important',
            backgroundColor: '#f8f9fa !important',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact'
          }
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#1976d2',
            fontSize: '24px',
            '@media print': {
              color: '#1976d2 !important',
              fontSize: '24px !important'
            }
          }}
        >
          {t('final-score')}: {points} {t('points')}
        </Typography>
      </Paper>
    </Box>
  );
};
