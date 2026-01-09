'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { mutate } from 'swr';
import {
  Alert,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Box
} from '@mui/material';
import { CheckCircle, Delete, Schedule } from '@mui/icons-material';
import { Division } from '@lems/types/api/admin';
import { apiFetch } from '@lems/shared';
import { useEvent } from '../../components/event-context';

interface ScheduleExistsProps {
  divisions: Division[];
}

export const ScheduleExists: React.FC<ScheduleExistsProps> = ({ divisions }) => {
  const t = useTranslations('pages.events.teams.schedule-exists');
  const event = useEvent();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);

  const divisionsWithSchedule = divisions.filter(division => division.hasSchedule);

  const handleDeleteSchedule = async () => {
    if (!selectedDivision) return;

    setIsDeleting(true);
    try {
      const response = await apiFetch(
        `/admin/events/${selectedDivision.eventId}/divisions/${selectedDivision.id}/schedule`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        await mutate(`/admin/events/${selectedDivision.eventId}/divisions`);
        setDeleteDialogOpen(false);
        setSelectedDivision(null);
      } else {
        console.error('Failed to delete schedule');
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (division: Division) => {
    setSelectedDivision(division);
    setDeleteDialogOpen(true);
  };

  if (divisionsWithSchedule.length === 0) {
    return null;
  }

  return (
    <>
      <Stack spacing={2} mb={2}>
        {divisionsWithSchedule.map(division => (
          <Alert
            key={division.id}
            severity="info"
            icon={<CheckCircle />}
            sx={{ py: 0.5 }}
            action={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  color="primary"
                  size="small"
                  startIcon={<Schedule />}
                  href={`/admin/events/${event.slug}/schedule?division=${division.id}`}
                  sx={{ color: 'primary.main' }}
                >
                  {t('view-schedule')}
                </Button>
                <Button
                  color="error"
                  size="small"
                  startIcon={<Delete />}
                  onClick={() => openDeleteDialog(division)}
                  sx={{ color: 'error.main' }}
                >
                  {t('delete-schedule')}
                </Button>
              </Box>
            }
          >
            {(divisions.length > 1 
              ? t('division-message', { divisionName: division.name }) 
              : t('event-message', { eventName: event.name })
              )}
          </Alert>
        ))}
      </Stack>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('delete-schedule-dialog.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('delete-schedule-dialog.message')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
            {t('delete-schedule-dialog.cancel')}
          </Button>
          <Button
            onClick={handleDeleteSchedule}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={18} /> : <Delete />}
          >
            {isDeleting
              ? t('delete-schedule-dialog.deleting')
              : t('delete-schedule-dialog.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
