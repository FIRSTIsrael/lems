'use client';

import { useTranslations } from 'next-intl';
import { Typography } from '@mui/material';
import { useEvent } from '../layout';

export default function EditEventPage() {
  const event = useEvent();
  const t = useTranslations('pages.events.divisions');

  return (
    <>
      <Typography variant="h1" gutterBottom>
        {t('title', { eventName: event.name })}
      </Typography>
    </>
  );
}
