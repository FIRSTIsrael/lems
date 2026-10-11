import { useTranslations } from 'next-intl';
import { Paper, Typography, Stack } from '@mui/material';
import { TableRestaurant } from '@mui/icons-material';

export const EmptyState: React.FC = () => {
  const t = useTranslations('pages.reports.practice-tables');

  return (
    <Paper
      sx={{
        p: 6,
        textAlign: 'center',
        bgcolor: 'background.default'
      }}
    >
      <Stack spacing={2} sx={{ alignItems: 'center' }}>
        <TableRestaurant sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5 }} />
        <Typography variant="h6" color="text.secondary">
          {t('empty-state')}
        </Typography>
      </Stack>
    </Paper>
  );
};
