'use client';

import { useTranslations } from 'next-intl';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';

interface ResetScoresheetDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetScoresheetDialog: React.FC<ResetScoresheetDialogProps> = ({
  open,
  onClose,
  onConfirm
}) => {
  const t = useTranslations('pages.scoresheet');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="reset-scoresheet-dialog-title"
      aria-describedby="reset-scoresheet-dialog-description"
    >
      <DialogTitle id="reset-scoresheet-dialog-title" sx={{ pb: 1 }}>
        {t('reset-dialog.title')}
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          id="reset-scoresheet-dialog-description"
          sx={{ mt: 1, color: 'warning.main', fontWeight: 500 }}
        >
          {t('reset-dialog.warning')}
        </DialogContentText>
        <DialogContentText sx={{ mt: 1.5 }}>{t('reset-dialog.description')}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button
          onClick={onClose}
          color="inherit"
          sx={{ textTransform: 'none', fontSize: '0.95rem' }}
        >
          {t('reset-dialog.cancel')}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          sx={{ textTransform: 'none', fontSize: '0.95rem' }}
        >
          {t('reset-dialog.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
