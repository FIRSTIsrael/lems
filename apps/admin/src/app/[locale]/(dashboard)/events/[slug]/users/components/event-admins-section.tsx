'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  IconButton,
  Alert
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { AdminUser } from '@lems/types/api/admin';
import { useEvent } from '../../components/event-context';
import { AssignAdminsDialog } from './assign-admins-dialog';

interface EventAdmin extends AdminUser {
  permissions?: string[];
}

export function EventAdminsSection() {
  const event = useEvent();
  const t = useTranslations('pages.events.users.sections.eventAdmins');

  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: eventAdmins = [], mutate } = useSWR<EventAdmin[]>(
    `/admin/events/${event.id}/admins`
  );

  const handleAssignAdmins = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleAdminsAssigned = () => {
    mutate(); // Revalidate the data
  };

  const handleRemoveAdmin = async (adminId: string) => {
    try {
      const response = await fetch(`/api/admin/events/${event.id}/admins/${adminId}`, {
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

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">{t('currentAdmins')}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAssignAdmins}>
          {t('assignAdmins')}
        </Button>
      </Stack>

      {eventAdmins.length === 0 ? (
        <Alert severity="info">{t('noAdmins')}</Alert>
      ) : (
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
                    {admin.permissions && admin.permissions.length > 0 && (
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        {admin.permissions.map(permission => (
                          <Chip
                            key={permission}
                            label={permission}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    )}
                  </Box>
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveAdmin(admin.id)}
                    aria-label={t('removeAdmin')}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <AssignAdminsDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onAdminsAssigned={handleAdminsAssigned}
      />
    </Box>
  );
}
