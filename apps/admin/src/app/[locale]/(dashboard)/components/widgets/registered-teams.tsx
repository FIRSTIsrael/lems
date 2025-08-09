import { getTranslations } from 'next-intl/server';
import GroupsIcon from '@mui/icons-material/Groups';
import NumberWidget from './number-widget';

export default async function RegisteredTeamsWidget() {
  const t = await getTranslations('pages.index.widgets.registered-teams');

  // TODO: Replace with actual backend call
  const teams: unknown[] = [];
  const teamCount = teams.length;

  return (
    <NumberWidget
      value={teamCount}
      description={t('description')}
      icon={<GroupsIcon sx={{ width: 48, height: 48 }} />}
    />
  );
}
