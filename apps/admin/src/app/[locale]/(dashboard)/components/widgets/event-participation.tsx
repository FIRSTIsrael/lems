import { getTranslations } from 'next-intl/server';
import { PeopleAlt } from '@mui/icons-material';
import { AdminSeasonResponseSchema } from '@lems/types/api/admin/seasons';
import { AdminSummarizedEventsResponseSchema } from '@lems/types/api/admin/events';
import { apiFetch } from '@lems/shared';
import NumberWidget from './number-widget';

export default async function EventParticipationWidget() {
  const t = await getTranslations('pages.index.widgets.event-participation');

  const seasonResult = await apiFetch('/admin/seasons/current', {}, AdminSeasonResponseSchema);

  let totalParticipants = 0;

  if (seasonResult.ok) {
    const eventsResult = await apiFetch(
      `/admin/events/season/${seasonResult.data.id}/summary`,
      {},
      AdminSummarizedEventsResponseSchema
    );

    if (eventsResult.ok) {
      totalParticipants = eventsResult.data.reduce((sum, event) => sum + event.teamCount, 0);
    }
  }

  return (
    <NumberWidget
      value={totalParticipants}
      description={t('description')}
      icon={<PeopleAlt sx={{ width: 48, height: 48 }} />}
    />
  );
}
