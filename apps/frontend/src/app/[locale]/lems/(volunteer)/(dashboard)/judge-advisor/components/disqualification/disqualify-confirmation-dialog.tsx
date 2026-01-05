'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { useTranslations } from 'next-intl';
import BlockIcon from '@mui/icons-material/Block';
import WarningIcon from '@mui/icons-material/Warning';
import type { Team } from '../../graphql/types';

interface DisqualifyConfirmationDialogProps {
  open: boolean;
  team: Team | null;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DisqualifyConfirmationDialog({
  open,
  team,
  loading = false,
  onConfirm,
  onCancel
}: DisqualifyConfirmationDialogProps) {
  const t = useTranslations('pages.judge-advisor.awards.disqualification');

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="disqualify-dialog-title"
      aria-describedby="disqualify-dialog-description"
    >
      <DialogTitle
        id="disqualify-dialog-title"
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <WarningIcon sx={{ color: 'warning.main' }} />
        {t('confirm-title')}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="disqualify-dialog-description" sx={{ mt: 2 }}>
          {team && (
            <>
              {t('confirm-message')}{' '}
              <strong>
                {team.name} #{team.number}
              </strong>
              ?
            </>
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onCancel} variant="outlined">
          {t('cancel')}
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          startIcon={<BlockIcon />}
          disabled={loading}
        >
          {t('confirm-disqualify')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
