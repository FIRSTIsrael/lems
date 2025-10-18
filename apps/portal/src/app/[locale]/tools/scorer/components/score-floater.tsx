'use client';

import { use, useContext } from 'react';
import { Typography, Stack, Paper, IconButton, Slide } from '@mui/material';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import { MissionContext } from './mission-context';
import { useTranslations } from 'next-intl';

export const ScoreFloater = () => {
  const t = useTranslations('pages.tools.scorer');
  const { points, resetScore } = useContext(MissionContext);

  return (
    <Slide direction="up" in={Boolean(points)} unmountOnExit>
      <Stack
        component={Paper}
        direction="row"
        alignItems="center"
        justifyContent="center"
        spacing={3}
        sx={{
          p: 4,
          position: 'fixed',
          bottom: 10,
          left: 0,
          right: 0,
          margin: 'auto',
          width: { xs: '95%', md: '400px' },
          zIndex: 1,
          bgcolor: 'primary.main',
          borderRadius: 4,
          height: 50
        }}
      >
        <Typography sx={{ color: '#FFF' }} fontWeight={500} fontSize="1.25rem">
          {t('score', { points })}
        </Typography>
        <IconButton sx={{ color: '#FFF' }} onClick={resetScore}>
          <RestartAltRoundedIcon />
        </IconButton>
      </Stack>
    </Slide>
  );
};
