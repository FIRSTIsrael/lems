import { getTranslations } from 'next-intl/server';
import { Groups } from '@mui/icons-material';
import { AdminTeamsResponseSchema } from '@lems/types/api/admin/teams';
import { apiFetch } from '@lems/shared';
import NumberWidget from './number-widget';

export default async function RegisteredTeamsWidget() {
  const t = await getTranslations('pages.index.widgets.registered-teams');

  const result = await apiFetch('/admin/teams', {}, AdminTeamsResponseSchema);
  const teamCount = result.ok ? result.data.filter(team => team.active).length : 0;

  return (
    <NumberWidget
      value={teamCount}
      description={t('description')}
      icon={<Groups sx={{ width: 48, height: 48 }} />}
    />
  );
}
