import { getTranslations } from 'next-intl/server';
import { Typography } from '@mui/material';
import { AdminSeasonsResponseSchema } from '@lems/types/api/admin';
import { apiFetch } from '../../../../lib/fetch';
import { SeasonsGrid } from './components/seasons-grid';

export default async function SeasonsPage() {
  const t = await getTranslations('pages.seasons');

  const result = await apiFetch('/admin/seasons', {}, AdminSeasonsResponseSchema);

  if (!result.ok) {
    throw new Error('Failed to load seasons');
  }

  const { data: seasons } = result;

  return (
    <>
      <Typography variant="h1" gutterBottom>
        {t('title')}
      </Typography>
      <SeasonsGrid seasons={seasons} />
    </>
  );
}
