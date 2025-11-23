'use client';

import { Stack, Button } from '@mui/material';
import { useTranslations } from 'next-intl';

interface RubricActionsProps {
  disabled?: boolean;
  onReset?: () => void;
}

export const RubricActions: React.FC<RubricActionsProps> = ({ disabled = false, onReset }) => {
  const t = useTranslations('pages.rubric.actions');

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      justifyContent="center"
      alignItems="center"
      sx={{ pt: 2, pb: 1 }}
    >
      <Button
        variant="outlined"
        size="large"
        disabled={disabled}
        onClick={onReset}
        sx={{ minWidth: 160 }}
      >
        {t('reset')}
      </Button>
    </Stack>
  );
};
