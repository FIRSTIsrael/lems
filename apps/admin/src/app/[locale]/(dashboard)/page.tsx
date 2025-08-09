import { getTranslations } from 'next-intl/server';
import { Typography } from '@mui/material';
import { AdminUserPermissionsResponseSchema } from '@lems/types/api/admin/users';
import { apiFetch } from '../../../lib/fetch';

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
    </>
  );
}
