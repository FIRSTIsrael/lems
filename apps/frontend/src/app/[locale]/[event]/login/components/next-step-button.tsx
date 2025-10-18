'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useFormikContext } from 'formik';
import { Box, Button, alpha } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { LoginFormValues } from '../types';
import { useVolunteer } from './volunteer-context';

interface NextStepButtonProps {
  type?: 'button' | 'submit';
  onClick: () => Promise<void> | void;
}

export function NextStepButton({ type, onClick }: NextStepButtonProps) {
  const t = useTranslations('pages.login');
  const { isValid, isSubmitting } = useFormikContext<LoginFormValues>();
  const { isReady } = useVolunteer();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onClick();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" width="100%">
      <Button
        type={type}
        variant="contained"
        size="large"
        disabled={isSubmitting || !isValid || !isReady}
        loading={isSubmitting || loading}
        endIcon={<ArrowForward />}
        sx={{
          borderRadius: 3,
          py: 1.75,
          px: 4,
          width: { xs: '100%', sm: '60%' },
          fontWeight: 600,
          fontSize: '1rem',
          background: theme =>
            `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          boxShadow: theme =>
            `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}, 0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            background: theme =>
              `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            transform: 'translateY(-2px)',
            boxShadow: theme =>
              `0 6px 20px ${alpha(theme.palette.primary.main, 0.5)}, 0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
          },
          '&:active': {
            transform: 'translateY(0px)'
          },
          '&.Mui-disabled': {
            background: theme => alpha(theme.palette.grey[400], 0.3),
            color: theme => alpha(theme.palette.text.primary, 0.4)
          }
        }}
        onClick={handleClick}
      >
        {isSubmitting ? t('submitting') : t('continue')}
      </Button>
    </Box>
  );
}
