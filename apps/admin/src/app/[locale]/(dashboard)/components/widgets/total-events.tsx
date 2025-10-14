import { getTranslations } from 'next-intl/server';
import { Event } from '@mui/icons-material';
import { AdminSeasonResponseSchema } from '@lems/types/api/admin/seasons';
import { AdminSummarizedEventsResponseSchema } from '@lems/types/api/admin/events';
import { apiFetch } from '@lems/shared';
import NumberWidget from './number-widget';

export default async function TotalEventsWidget() {
  const t = await getTranslations('pages.index.widgets.total-events');

  const seasonResult = await apiFetch('/admin/seasons/current', {}, AdminSeasonResponseSchema);

  let eventCount = 0;

  if (seasonResult.ok) {
    const eventsResult = await apiFetch(
      `/admin/events/season/${seasonResult.data.id}/summary`,
      {},
      AdminSummarizedEventsResponseSchema
    );

    if (eventsResult.ok) {
      eventCount = eventsResult.data.length;
    }
  }

  return (
    <NumberWidget
      value={eventCount}
      description={t('description')}
      icon={<Event sx={{ width: 48, height: 48 }} />}
    />
  );
}
