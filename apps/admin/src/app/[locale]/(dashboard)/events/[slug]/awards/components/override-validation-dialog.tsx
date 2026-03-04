'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AlertTitle,
  Button,
  Stack,
  Typography,
  CircularProgress,
  Box
} from '@mui/material';
import { WarningAmber as WarningIcon } from '@mui/icons-material';
import type { ValidationResult } from '../utils/validation';

interface OverrideValidationDialogProps {
  open: boolean;
  validation: ValidationResult;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const OverrideValidationDialog: React.FC<OverrideValidationDialogProps> = ({
  open,
  validation,
  isLoading,
  onClose,
  onConfirm
}) => {
  const t = useTranslations('pages.events.awards.override-dialog');
  const tValidation = useTranslations('pages.events.awards.validation');
  const [localLoading, setLocalLoading] = useState(false);

  const handleConfirm = useCallback(async () => {
    setLocalLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      // Error is handled by the context
    } finally {
      setLocalLoading(false);
    }
  }, [onConfirm, onClose]);

  const isProcessing = isLoading || localLoading;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={isProcessing}
      PaperProps={{
        sx: { borderRadius: 1 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>{t('title')}</DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {t('description')}
          </Typography>

          <Alert severity="warning" icon={<WarningIcon />}>
            <AlertTitle sx={{ fontWeight: 600, mb: 1 }}>{tValidation('title')}</AlertTitle>
            <Stack spacing={1}>
              {validation.reasons.length > 0 ? (
                validation.reasons.map((reason, index) => (
                  <Typography key={index} variant="body2">
                    • {tValidation(reason.key, { count: reason.count || 0 })}
                  </Typography>
                ))
              ) : (
                <Typography variant="body2">{t('no-specific-errors')}</Typography>
              )}
            </Stack>
          </Alert>

          <Box sx={{ p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
            <Typography variant="caption" color="info.dark">
              {t('note')}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={isProcessing}>
          {t('cancel')}
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isProcessing}
          variant="contained"
          color="error"
          startIcon={isProcessing ? <CircularProgress size={20} /> : undefined}
        >
          {isProcessing ? t('saving') : t('continue')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
