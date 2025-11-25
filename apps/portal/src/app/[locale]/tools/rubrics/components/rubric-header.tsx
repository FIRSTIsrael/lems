'use client';

import { useTranslations } from 'next-intl';
import { Typography, Stack, Button, Box, CircularProgress } from '@mui/material';
import { useRubricContext } from './rubric-context';

export const RubricHeader = () => {
  const t = useTranslations('pages.tools.rubrics');
  const { resetRubric, loading } = useRubricContext();

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Stack direction="row" alignItems="center" spacing={3}>
        <Typography variant="h2" gutterBottom sx={{ my: 2 }}>
          {t('title')}
        </Typography>

        {loading && <CircularProgress size={24} />}
      </Stack>
      <Box>
        <Button
          variant="outlined"
          size="large"
          onClick={resetRubric}
          disabled={loading}
          sx={{ minWidth: 100 }}
        >
          {t('actions.reset')}
        </Button>
      </Box>
    </Stack>
  );
};
