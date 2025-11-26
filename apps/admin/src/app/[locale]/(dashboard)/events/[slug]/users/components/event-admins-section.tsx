'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  IconButton,
  Alert
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { AdminUser } from '@lems/types/api/admin';
import { apiFetch } from '@lems/shared';
import { useEvent } from '../../components/event-context';
import { AssignAdminsDialog } from './assign-admins-dialog';
import { useSession } from '../../../../components/session-context';

export function EventAdminsSection() {
  const event = useEvent();
  const { user } = useSession();
  const t = useTranslations('pages.events.users.sections.event-admins');

  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: eventAdmins = null, mutate } = useSWR<AdminUser[] | null>(
    `/admin/events/${event.id}/users/admins`,
    { suspense: true, fallbackData: null }
  );

  const handleRemoveAdmin = async (adminId: string) => {
    try {
      const response = await apiFetch(`/admin/events/${event.id}/users/admins/${adminId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        mutate();
      } else {
        console.error('Failed to remove admin');
      }
    } catch (error) {
      console.error('Error removing admin:', error);
    }
  };

  if (!eventAdmins) {
    return null;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {t('title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t('description')}
      </Typography>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">{t('current-admins')}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          {t('assign-admins')}
        </Button>
      </Stack>

      {eventAdmins.length === 0 && <Alert severity="info">{t('no-admins')}</Alert>}

      <Stack spacing={2}>
        {eventAdmins.map(admin => (
          <Card key={admin.id} variant="outlined">
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle1">
                    {admin.firstName} {admin.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    @{admin.username}
                  </Typography>
                </Box>
                <IconButton
                  color="error"
                  onClick={() => handleRemoveAdmin(admin.id)}
                  disabled={admin.id === user.id}
                  aria-label={t('remove-admin')}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <AssignAdminsDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
}
