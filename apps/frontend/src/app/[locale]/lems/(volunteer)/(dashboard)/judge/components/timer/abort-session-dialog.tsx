'use client';

import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import { Warning } from '@mui/icons-material';

interface AbortSessionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const AbortSessionDialog: React.FC<AbortSessionDialogProps> = ({
  open,
  onClose,
  onConfirm
}) => {
  const t = useTranslations('pages.judge.timer.abort-dialog');

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="abort-dialog-title"
      aria-describedby="abort-dialog-description"
    >
      <DialogTitle
        id="abort-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          color: 'error.main'
        }}
      >
        <Warning />
        {t('title')}
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          id="abort-dialog-description"
          sx={{
            color: 'text.primary',
            fontSize: '0.9375rem'
          }}
        >
          {t('message')}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          onClick={onClose}
          variant="text"
          sx={{
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          {t('cancel')}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            px: 3
          }}
        >
          {t('confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
