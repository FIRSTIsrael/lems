import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

export const EmptyState: React.FC = () => {
  const t = useTranslations('pages.reports.field-schedule');

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 300,
        textAlign: 'center'
      }}
    >
      <Typography variant="body1" color="text.secondary">
        {t('empty-state')}
      </Typography>
    </Box>
  );
};
