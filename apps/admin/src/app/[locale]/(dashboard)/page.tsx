import { getTranslations } from 'next-intl/server';
import { Typography } from '@mui/material';

export default async function HomePage() {
  const t = await getTranslations('pages.index');

  return (
    <>
      <Typography variant="h1">{t('title')}</Typography>
    </>
  );
}
