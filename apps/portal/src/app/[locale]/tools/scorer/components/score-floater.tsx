'use client';

import { useContext } from 'react';
import { Typography, Stack, Paper, IconButton, Slide } from '@mui/material';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import { useTranslations } from 'next-intl';
import { useScoresheetGeneralTranslations } from '@lems/localization';
import { useToolEdition } from '../../hooks/use-tool-edition';
import { MissionContext } from './mission-context';

export const ScoreFloater = () => {
  const t = useTranslations('pages.tools.scorer');
  const { points, scoreOverridden, resetScore } = useContext(MissionContext);
  const { getTerm } = useScoresheetGeneralTranslations(useToolEdition());

  return (
    <Slide direction="up" in={points > 0 || scoreOverridden} unmountOnExit>
      <Stack
        component={Paper}
        spacing={0.5}
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          position: 'fixed',
          bottom: 10,
          left: 0,
          right: 0,
          margin: 'auto',
          width: { xs: '95%', md: '400px' },
          zIndex: 1,
          bgcolor: 'primary.main',
          borderRadius: 4
        }}
      >
        <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
          <Typography
            sx={{
              fontWeight: 500,
              fontSize: '1.25rem',
              color: '#FFF'
            }}
          >
            {t('score', { points })}
          </Typography>
          <IconButton sx={{ color: '#FFF' }} onClick={resetScore}>
            <RestartAltRoundedIcon />
          </IconButton>
        </Stack>
        {scoreOverridden && (
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: '#FFF',
              textAlign: 'center'
            }}
          >
            {getTerm('score-overridden')}
          </Typography>
        )}
      </Stack>
    </Slide>
  );
};
