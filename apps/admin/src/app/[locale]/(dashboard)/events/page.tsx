import { getTranslations } from 'next-intl/server';
import { Typography } from '@mui/material';

export default async function EventsPage() {
  const t = await getTranslations('pages.events');

  return <Typography variant="h1">{t('title')}</Typography>;
}
