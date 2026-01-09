'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { mutate } from 'swr';
import {
  Alert,
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
  division: Division;
}

export const ScheduleExists: React.FC<ScheduleExistsProps> = ({ division }) => {
  const t = useTranslations('pages.events.venue.schedule-exists');
  const event = useEvent();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteSchedule = async () => {
    setIsDeleting(true);
    try {
      const response = await apiFetch(
        `/admin/events/${division.eventId}/divisions/${division.id}/schedule`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        await mutate(`/admin/events/${division.eventId}/divisions`);
        await mutate(`/admin/events/season/${event.seasonId}/summary`);
        setDeleteDialogOpen(false);
      } else {
        console.error('Failed to delete schedule');
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!division.hasSchedule) {
    return null;
  }

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Alert
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
                onClick={() => setDeleteDialogOpen(true)}
                sx={{ color: 'error.main' }}
              >
                {t('delete-schedule')}
              </Button>
            </Box>
          }
        >
          {t('message', { divisionName: division.name }) }
        </Alert>
      </Box>

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
