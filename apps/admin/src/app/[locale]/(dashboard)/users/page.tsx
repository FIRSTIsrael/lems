import { getTranslations } from 'next-intl/server';
import { Typography, Stack, Box } from '@mui/material';
import { AdminUsersResponseSchema } from '@lems/types/api/admin';
import { apiFetch } from '../../../../lib/fetch';
import { CreateUserButton } from './components/create-user-button';
import { UsersDataGrid } from './components/users-data-grid';

export default async function UsersPage() {
  const t = await getTranslations('pages.users');

  const result = await apiFetch('/admin/users', {}, AdminUsersResponseSchema);

  if (!result.ok) {
    throw new Error('Failed to load users');
  }

  const { data: users } = result;

  return (
    <Box
      sx={{
        height: 'calc(100vh - 120px)', // Adjust based on header/padding
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Stack direction="row" alignItems="center" gap={2} mb={3}>
        <Typography variant="h1" gutterBottom sx={{ mb: 0 }}>
          {t('title')}
        </Typography>
        <CreateUserButton />
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <UsersDataGrid users={users} />
      </Box>
    </Box>
  );
}
