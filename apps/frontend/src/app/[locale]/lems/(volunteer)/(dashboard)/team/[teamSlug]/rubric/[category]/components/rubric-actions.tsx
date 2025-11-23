'use client';

import { Stack, Button } from '@mui/material';
import { useTranslations } from 'next-intl';

interface RubricActionsProps {
  disabled?: boolean;
}

export const RubricActions: React.FC<RubricActionsProps> = ({ disabled = false }) => {
  const t = useTranslations('pages.rubric.actions');

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      justifyContent="center"
      alignItems="center"
      sx={{ pt: 2, pb: 1 }}
    >
      <Button variant="contained" size="large" disabled={disabled} sx={{ minWidth: 160 }}>
        {t('save-draft')}
      </Button>

      <Button variant="contained" size="large" disabled={disabled} sx={{ minWidth: 160 }}>
        {t('submit-review')}
      </Button>

      <Button variant="outlined" size="large" disabled={disabled} sx={{ minWidth: 160 }}>
        {t('reset')}
      </Button>
    </Stack>
  );
};
