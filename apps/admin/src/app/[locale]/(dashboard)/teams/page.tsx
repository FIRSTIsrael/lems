import { getTranslations } from 'next-intl/server';
import { Typography, Box } from '@mui/material';
import { AdminTeamsResponseSchema } from '@lems/types/api/admin';
import { apiFetch } from '../../../../lib/fetch';
import { CreateTeamButton } from './components/create-team-button';
import { TeamsDataGrid } from './components/teams-data-grid';

export default async function TeamsPage() {
  const t = await getTranslations('pages.teams');

  const result = await apiFetch('/admin/teams', {}, AdminTeamsResponseSchema);

  if (!result.ok) {
    throw new Error(`Failed to fetch teams: ${result.status} ${result.statusText}`);
  }

  const { data: teams } = result;

  return (
    <>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Typography variant="h1" gutterBottom sx={{ mb: 0 }}>
          {t('title')}
        </Typography>
        <CreateTeamButton />
      </Box>
      <TeamsDataGrid teams={teams} />
    </>
  );
}
