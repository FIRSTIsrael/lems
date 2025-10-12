import { Box, Button, CircularProgress } from '@mui/material';
import { useTranslations } from 'next-intl';
import { ChevronEndIcon } from '@lems/localization';

interface SubmitButtonProps {
  isSubmitting: boolean;
  isValid: boolean;
  isLoading: boolean;
}

export function SubmitButton({ isSubmitting, isValid, isLoading }: SubmitButtonProps) {
  const t = useTranslations('pages.login');

  return (
    <Box display="flex" justifyContent="center" width="100%">
      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={isSubmitting || !isValid || isLoading}
        endIcon={isSubmitting ? <CircularProgress size={20} /> : <ChevronEndIcon />}
        sx={{ borderRadius: 2, py: 1.5, width: '50%' }}
      >
        {isSubmitting ? t('submitting') : t('continue')}
      </Button>
    </Box>
  );
}
