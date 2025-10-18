'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useFormikContext } from 'formik';
import { Box, Button } from '@mui/material';
import { LoginFormValues } from '../types';

interface NextStepButtonProps {
  type?: 'button' | 'submit';
  onClick: () => Promise<void>;
}

export function NextStepButton({ type, onClick }: NextStepButtonProps) {
  const t = useTranslations('pages.login');
  const { isValid, isSubmitting } = useFormikContext<LoginFormValues>();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await onClick();
    setLoading(false);
  };

  return (
    <Box display="flex" justifyContent="center" width="100%">
      <Button
        type={type}
        variant="contained"
        size="large"
        disabled={isSubmitting || !isValid}
        loading={isSubmitting || loading}
        sx={{ borderRadius: 2, py: 1.5, width: '50%' }}
        onClick={handleClick}
      >
        {isSubmitting ? t('submitting') : t('continue')}
      </Button>
    </Box>
  );
}
