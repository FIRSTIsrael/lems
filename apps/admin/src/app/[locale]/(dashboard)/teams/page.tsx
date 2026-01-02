import { getTranslations } from 'next-intl/server';
import { Typography, Stack, Box } from '@mui/material';
import { AdminTeamsResponseSchema } from '@lems/types/api/admin';
import { apiFetch } from '@lems/shared';
import { CreateTeamButton } from './components/create-team-button';
import { ImportTeamButton } from './components/import-team-button';
import { TeamsDataGrid } from './components/teams-data-grid';

export default async function TeamsPage() {
  const t = await getTranslations('pages.teams');

  const result = await apiFetch('/admin/teams?extraFields=deletable', {}, AdminTeamsResponseSchema);

  if (!result.ok) {
    throw new Error('Failed to load teams');
  }

  const { data: teams } = result;

  return (
    <Box
      sx={{
        height: 'calc(100vh - 52px)', // Adjust based on header/padding
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Stack direction="row" alignItems="center" gap={2} mb={3}>
        <Typography variant="h1" gutterBottom sx={{ mb: 0 }}>
          {t('title')}
        </Typography>
        <CreateTeamButton />
        <ImportTeamButton />
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <TeamsDataGrid teams={teams} />
      </Box>
    </Box>
  );
}
