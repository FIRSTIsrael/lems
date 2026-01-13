'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { CheckCircle as ApproveIcon, EmojiEvents } from '@mui/icons-material';
import { useMutation } from '@apollo/client/react';
import toast from 'react-hot-toast';
import { COMPLETE_FINAL_DELIBERATION_MUTATION } from '../../graphql/mutations';

interface ApprovalModalProps {
  open: boolean;
  onClose: () => void;
  divisionId: string;
  onSuccess: () => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  open,
  onClose,
  divisionId,
  onSuccess
}) => {
  const t = useTranslations('pages.deliberations.final.review');
  const [isLoading, setIsLoading] = useState(false);

  const [completeDeliberation] = useMutation(COMPLETE_FINAL_DELIBERATION_MUTATION, {
    onCompleted: () => {
      setIsLoading(false);
      onClose();
      toast.success(t('approval-modal.success-message'));
      onSuccess();
    },
    onError: error => {
      setIsLoading(false);
      toast.error(t('approval-modal.error-message'));
      console.error('Completion failed:', error);
    }
  });

  const handleConfirm = useCallback(async () => {
    setIsLoading(true);
    try {
      await completeDeliberation({
        variables: {
          divisionId
        }
      });
    } catch {
      // Error handled in mutation onError
    }
  }, [completeDeliberation, divisionId]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="approval-dialog-title"
      aria-describedby="approval-dialog-description"
    >
      <DialogTitle
        id="approval-dialog-title"
        sx={{
          fontWeight: 700,
          fontSize: '1.25rem',
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <ApproveIcon sx={{ color: 'success.main' }} />
        {t('approval-modal.title')}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <DialogContentText
            id="approval-dialog-description"
            sx={{ color: 'text.primary', fontWeight: 500 }}
          >
            {t('approval-modal.description')}
          </DialogContentText>

          <Alert severity="warning" icon={<EmojiEvents />} sx={{ bgcolor: 'warning.50' }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {t('approval-modal.warning-text')}
            </Typography>
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={isLoading}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          {t('approval-modal.cancel')}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="success"
          disabled={isLoading}
          sx={{ textTransform: 'none', fontWeight: 600, minWidth: 120 }}
          startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
        >
          {isLoading ? t('approval-modal.submitting') : t('approval-modal.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
