import { useTranslations } from 'next-intl';
import { Paper, Typography, Stack } from '@mui/material';
import { Error } from '@mui/icons-material';

export const ErrorState: React.FC = () => {
  const t = useTranslations('pages.reports.practice-tables');

  return (
    <Paper
      sx={{
        p: 6,
        textAlign: 'center',
        bgcolor: 'error.light',
        color: 'error.contrastText'
      }}
    >
      <Stack spacing={2} sx={{ alignItems: 'center' }}>
        <Error sx={{ fontSize: 64 }} />
        <Typography variant="h6">{t('error-state')}</Typography>
      </Stack>
    </Paper>
  );
};
