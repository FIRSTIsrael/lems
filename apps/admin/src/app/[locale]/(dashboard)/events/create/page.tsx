import { getTranslations } from 'next-intl/server';
import { Typography } from '@mui/material';
import { CreateEventLayout } from './components/create-event-layout';

export default async function CreateEventPage() {
  const t = await getTranslations('pages.events.create');

  return (
    <>
      <Typography variant="h1" gutterBottom>
        {t('title')}
      </Typography>
      <CreateEventLayout />
    </>
  );
}
