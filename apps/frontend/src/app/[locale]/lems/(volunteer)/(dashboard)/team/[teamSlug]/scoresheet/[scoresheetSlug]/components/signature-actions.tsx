'use client';

import { Stack, Button, Typography, Box, useTheme, alpha } from '@mui/material';
import { useTranslations } from 'next-intl';
import ClearIcon from '@mui/icons-material/Clear';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface SignatureActionsProps {
  isSigned: boolean;
  onClear: () => void;
}

export const SignatureActions: React.FC<SignatureActionsProps> = ({ isSigned, onClear }) => {
  const t = useTranslations('pages.scoresheet');
  const theme = useTheme();

  return (
    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" mt={2}>
      {isSigned && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            padding: '8px 12px',
            backgroundColor: alpha(theme.palette.success.main, 0.1),
            borderRadius: 1,
            flexGrow: 1
          }}
        >
          <CheckCircleIcon
            sx={{
              color: theme.palette.success.main,
              fontSize: '1.25rem'
            }}
          />
          <Typography
            sx={{
              color: theme.palette.success.dark,
              fontSize: '0.875rem',
              fontWeight: 500
            }}
          >
            {t('signature-confirmed')}
          </Typography>
        </Box>
      )}

      {isSigned && (
        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={<ClearIcon />}
          onClick={onClear}
          sx={{
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          {t('clear-signature')}
        </Button>
      )}
    </Stack>
  );
};
