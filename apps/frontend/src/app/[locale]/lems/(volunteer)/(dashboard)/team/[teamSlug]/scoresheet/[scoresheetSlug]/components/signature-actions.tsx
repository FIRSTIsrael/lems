'use client';

import { Stack, Button } from '@mui/material';
import { useTranslations } from 'next-intl';
import ClearIcon from '@mui/icons-material/Clear';

interface SignatureActionsProps {
  isSigned: boolean;
  onClear: () => void;
}

export const SignatureActions: React.FC<SignatureActionsProps> = ({ isSigned, onClear }) => {
  const t = useTranslations('pages.scoresheet');

  return (
    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" mt={2}>
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
