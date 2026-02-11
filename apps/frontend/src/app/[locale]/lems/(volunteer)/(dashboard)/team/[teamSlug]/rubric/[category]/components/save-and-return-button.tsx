'use client';

import React, { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';

interface SaveAndReturnButtonProps {
  disabled?: boolean;
}

export const SaveAndReturnButton: React.FC<SaveAndReturnButtonProps> = ({ disabled = false }) => {
  const t = useTranslations('pages.rubric');
  const router = useRouter();

  const handleReturn = useCallback(() => {
    router.push('/lems/judge');
  }, [router]);

  return (
    <Button
      variant="contained"
      color="primary"
      size="large"
      disabled={disabled}
      onClick={handleReturn}
      startIcon={<BackIcon />}
      sx={{
        minWidth: 150,
        py: 1.5,
        borderRadius: 2,
        textTransform: 'none',
        fontSize: '1rem',
        fontWeight: 600
      }}
    >
      {t('actions.save-and-return')}
    </Button>
  );
};
