'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Box,
  CircularProgress
} from '@mui/material';
import { useMutation } from '@apollo/client/react';
import { toast } from 'react-hot-toast';
import { COMPLETE_DELIBERATION_MUTATION } from '../graphql/mutations/complete-deliberation';
import { useCategoryDeliberation } from '../deliberation-context';

interface CompleteDeliberationModalProps {
  open: boolean;
  onClose: () => void;
}

export const CompleteDeliberationModal: React.FC<CompleteDeliberationModalProps> = ({
  open,
  onClose
}) => {
  const router = useRouter();
  const t = useTranslations('pages.deliberations.category.controls.complete-modal');
  const { division, deliberation } = useCategoryDeliberation();
  const [isLoading, setIsLoading] = useState(false);

  const [completeDeliberation] = useMutation(COMPLETE_DELIBERATION_MUTATION);

  const handleConfirm = useCallback(async () => {
    setIsLoading(true);
    try {
      await completeDeliberation({
        variables: {
          divisionId: division!.id,
          category: deliberation!.category
        }
      });
      toast.success(t('success-message'));
      router.push('/');
    } catch (error) {
      console.error('Failed to complete deliberation:', error);
      toast.error(t('error-message'));
    } finally {
      setIsLoading(false);
    }
  }, [completeDeliberation, division, deliberation, t, router]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem', pb: 1 }}>{t('title')}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body1" color="text.secondary">
            {t('description')}
          </Typography>

          <Box
            sx={{
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              display: 'flex',
              gap: 1.5,
              alignItems: 'flex-start'
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {t('warning-text')}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={isLoading}
          sx={{
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          {t('cancel')}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="success"
          disabled={isLoading}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            minWidth: 120
          }}
          startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
        >
          {isLoading ? t('submitting') : t('confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
