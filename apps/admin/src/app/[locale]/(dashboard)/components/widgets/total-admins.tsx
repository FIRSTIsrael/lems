import { getTranslations } from 'next-intl/server';
import { AdminPanelSettings } from '@mui/icons-material';
import { AdminUsersResponseSchema } from '@lems/types/api/admin/users';
import { apiFetch } from '@lems/shared';
import NumberWidget from './number-widget';

export default async function TotalAdminsWidget() {
  const t = await getTranslations('pages.index.widgets.total-admins');

  const result = await apiFetch('/admin/users', {}, AdminUsersResponseSchema);
  const adminCount = result.ok ? result.data.length : 0;

  return (
    <NumberWidget
      value={adminCount}
      description={t('description')}
      icon={<AdminPanelSettings sx={{ width: 48, height: 48 }} />}
    />
  );
}
