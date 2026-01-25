import dayjs from 'dayjs';
import { getTranslations } from 'next-intl/server';
import { Avatar, Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { AdminSeasonResponseSchema } from '@lems/types/api/admin/seasons';
import { apiFetch } from '@lems/shared';
import { getAsset } from '../../../../../lib/assets';

export default async function CurrentSeasonWidget() {
  const t = await getTranslations('pages.index.widgets.current-season');

  const result = await apiFetch('/admin/seasons/current', {}, AdminSeasonResponseSchema);

  if (!result.ok) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent
          sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Stack spacing={1} alignItems="center" textAlign="center">
            <Typography variant="h6" color="error.main" fontWeight={600}>
              {t('error')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('error-description')}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  const { data: season } = result;

  const endDate = dayjs(season.endDate);
  const today = dayjs();
  const daysLeft = endDate.diff(today, 'day');

  const getDaysLeftText = () => {
    if (daysLeft > 0) {
      return t('days-left', { count: daysLeft });
    }
    if (daysLeft === 0) {
      return t('ends-today');
    }
    return t('ended', { count: Math.abs(daysLeft) });
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
        <Box display="flex" alignItems="center" gap={3} width="100%">
          <Avatar
            variant="rounded"
            src={season.logoUrl || getAsset('FIRST-Logo.svg')}
            sx={{
              width: 120,
              height: 120,
              flexShrink: 0,
              boxShadow: 2,
              bgcolor: 'background.paper',
              padding: 1.5
            }}
          />

          <Stack spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{
                lineHeight: 1,
                fontSize: '0.875rem',
                fontWeight: 600,
                letterSpacing: 0.5
              }}
            >
              {t('current-season')}
            </Typography>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                lineHeight: 1.2,
                wordBreak: 'break-word',
                color: 'text.primary'
              }}
            >
              {season.name}
            </Typography>

            <Typography
              variant="body1"
              color={daysLeft > 0 ? 'text.secondary' : 'error.main'}
              sx={{
                lineHeight: 1.3,
                fontWeight: 500,
                fontSize: '0.95rem'
              }}
            >
              {getDaysLeftText()}
            </Typography>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
