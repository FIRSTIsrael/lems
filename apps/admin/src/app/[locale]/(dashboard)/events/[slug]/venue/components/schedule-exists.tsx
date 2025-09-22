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
import { apiFetch } from '../../../../../../../lib/fetch';
import { useEvent } from '../../components/event-context';

interface ScheduleExistsProps {
  division: Division;
}

export const ScheduleExists: React.FC<ScheduleExistsProps> = ({ division }) => {
  const t = useTranslations('pages.events.venue');
  const scheduleT = useTranslations('pages.events.schedule');
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
                href={`/events/${event.slug}/schedule?division=${division.id}`}
                sx={{ color: 'primary.main' }}
              >
                {t('schedule-exists.view-schedule')}
              </Button>
              <Button
                color="error"
                size="small"
                startIcon={<Delete />}
                onClick={() => setDeleteDialogOpen(true)}
                sx={{ color: 'error.main' }}
              >
                {scheduleT('delete-schedule')}
              </Button>
            </Box>
          }
        >
          {t('schedule-exists.message', { divisionName: division.name })}
        </Alert>
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{scheduleT('delete-schedule-dialog.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{scheduleT('delete-schedule-dialog.message')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
            {scheduleT('delete-schedule-dialog.cancel')}
          </Button>
          <Button
            onClick={handleDeleteSchedule}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={18} /> : <Delete />}
          >
            {isDeleting
              ? scheduleT('delete-schedule-dialog.deleting')
              : scheduleT('delete-schedule-dialog.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
