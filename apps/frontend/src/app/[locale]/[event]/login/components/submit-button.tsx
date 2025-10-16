import { Box, Button, CircularProgress } from '@mui/material';
import { useTranslations } from 'next-intl';
import { ChevronRight, ChevronLeft } from '@mui/icons-material';
import { DirectionalIcon } from '@lems/localization';

interface SubmitButtonProps {
  isSubmitting: boolean;
  isValid: boolean;
}

export function SubmitButton({ isSubmitting, isValid }: SubmitButtonProps) {
  const t = useTranslations('pages.login');

  return (
    <Box display="flex" justifyContent="center" width="100%">
      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={isSubmitting || !isValid}
        endIcon={
          isSubmitting ? (
            <CircularProgress size={20} />
          ) : (
            <DirectionalIcon ltr={ChevronRight} rtl={ChevronLeft} />
          )
        }
        sx={{ borderRadius: 2, py: 1.5, width: '50%' }}
      >
        {isSubmitting ? t('submitting') : t('continue')}
      </Button>
    </Box>
  );
}
