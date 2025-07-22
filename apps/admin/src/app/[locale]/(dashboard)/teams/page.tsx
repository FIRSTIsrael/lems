import { getTranslations } from 'next-intl/server';
import { Typography } from '@mui/material';
import { AdminTeamsResponseSchema } from '@lems/types/api/admin';
import { apiFetch } from '../../../../lib/fetch';

export default async function TeamsPage() {
  const t = await getTranslations('pages.teams');

  const result = await apiFetch('/admin/teams', {}, AdminTeamsResponseSchema);

  if (!result.ok) {
    throw new Error(`Failed to fetch teams: ${result.status} ${result.statusText}`);
  }

  const { data: teams } = result;

  return (
    <>
      <Typography variant="h1" gutterBottom>
        {t('title')}
      </Typography>
      {teams.map(t => (
        <p>{JSON.stringify(t)}</p>
      ))}
    </>
  );
}
