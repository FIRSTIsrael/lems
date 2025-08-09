import { getTranslations } from 'next-intl/server';
import { Alert, Grid, Stack, Typography } from '@mui/material';
import { AdminUserPermissionsResponseSchema } from '@lems/types/api/admin/users';
import { apiFetch } from '../../../lib/fetch';
import CurrentSeasonWidget from './components/widgets/current-season';
import RegisteredTeamsWidget from './components/widgets/registered-teams';

export default async function HomePage() {
  const t = await getTranslations('pages.index');

  const result = await apiFetch(
    '/admin/users/permissions/me',
    {},
    AdminUserPermissionsResponseSchema
  );

  if (!result.ok) {
    throw new Error(`Failed to fetch permissions: ${result.status} ${result.statusText}`);
  }

  const { data: permissions } = result;

  return (
    <>
      <Typography variant="h1">{t('title')}</Typography>
      <Stack spacing={2} sx={{ mt: 2 }}>
        {permissions.length === 0 && (
          <Alert sx={{ maxWidth: 600 }} severity="info">
            {t('alerts.no-permissions')}
          </Alert>
        )}
        <Grid container columns={{ xs: 4, sm: 8, md: 8, lg: 12, xl: 16 }} spacing={3}>
          <Grid size={4}>
            <CurrentSeasonWidget />
          </Grid>
          <Grid size={4}>
            <RegisteredTeamsWidget />
          </Grid>
        </Grid>
      </Stack>
    </>
  );
}
