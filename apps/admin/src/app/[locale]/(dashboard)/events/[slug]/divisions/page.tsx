'use client';

import { useTranslations } from 'next-intl';
import { useEvent } from '../layout';
import { EventPageTitle } from '../components/event-page-title';

export default function EventDivisionsPage() {
  const event = useEvent();
  const t = useTranslations('pages.events.divisions');

  return (
    <>
      <EventPageTitle title={t('title', { eventName: event.name })} />
      {/* Division content will go here */}
    </>
  );
}
