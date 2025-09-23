import dayjs from 'dayjs';
import { getTranslations } from 'next-intl/server';
import { Avatar, Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { AdminSeasonResponseSchema } from '@lems/types/api/admin/seasons';
import { apiFetch } from '@lems/shared';

export default async function CurrentSeasonWidget() {
  const t = await getTranslations('pages.index.widgets.current-season');

  const result = await apiFetch('/admin/seasons/current', {}, AdminSeasonResponseSchema);

  if (!result.ok) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" color="error">
            {t('error')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('error-description')}
          </Typography>
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
      <CardContent>
        <Box display="flex" alignItems="flex-start" gap={2}>
          <Avatar
            variant="square"
            src={season.logoUrl || '/assets/FIRST-Logo.svg'}
            sx={{
              width: 150,
              height: 150,
              flexShrink: 0
            }}
          />

          <Stack spacing={1} sx={{ minWidth: 0, mt: 1.5 }}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ lineHeight: 1, fontSize: '1.25rem' }}
            >
              {t('current-season')}
            </Typography>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                lineHeight: 1.2,
                wordBreak: 'break-word'
              }}
            >
              {season.name}
            </Typography>

            <Typography
              variant="body2"
              color={daysLeft > 0 ? 'text.secondary' : 'error.main'}
              sx={{ lineHeight: 1.2, fontSize: '1rem' }}
            >
              {getDaysLeftText()}
            </Typography>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
