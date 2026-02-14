'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Box,
  useTheme,
  alpha
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useAwardTranslations } from '@lems/localization';
import WarningIcon from '@mui/icons-material/Warning';

interface AssignAwardConfirmationDialogProps {
  open: boolean;
  awardName: string | null;
  winnerName: string | null;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AssignAwardConfirmationDialog({
  open,
  awardName,
  winnerName,
  loading = false,
  onConfirm,
  onCancel
}: AssignAwardConfirmationDialogProps) {
  const t = useTranslations('pages.judge-advisor.awards.personal-awards');
  const { getName } = useAwardTranslations();
  const theme = useTheme();

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon sx={{ color: 'warning.main', fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t('confirm-assignment-title')}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {t('confirm-assignment-message')}
          </Typography>
          <Box
            sx={{
              p: 2,
              backgroundColor: alpha(theme.palette.info.main, 0.05),
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              borderRadius: 1
            }}
          >
            <Stack spacing={1}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('award-label')}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {awardName ? getName(awardName) : ''}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('winner-label')}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {winnerName}
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {t('confirm-assignment-warning')}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onCancel} disabled={loading}>
          {t('cancel')}
        </Button>
        <Button onClick={onConfirm} variant="contained" disabled={loading} sx={{ fontWeight: 600 }}>
          {loading ? t('assigning') : t('confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
