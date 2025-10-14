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
  CircularProgress
} from '@mui/material';
import { CheckCircle, Delete } from '@mui/icons-material';
import { Division } from '@lems/types/api/admin';
import { apiFetch } from '@lems/shared';
import { TeamSwapper } from './team-swapper/team-swapper';

interface ScheduleExistsProps {
  division: Division;
}

export const ScheduleExists: React.FC<ScheduleExistsProps> = ({ division }) => {
  const t = useTranslations('pages.events.schedule');

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

  return (
    <>
      <Stack height="100%" spacing={2}>
        <Alert
          severity="success"
          icon={<CheckCircle />}
          sx={{ py: 0.5 }}
          action={
            <Button
              color="error"
              size="small"
              startIcon={<Delete />}
              onClick={() => setDeleteDialogOpen(true)}
              sx={{ color: 'error.main' }}
            >
              {t('delete-schedule')}
            </Button>
          }
        >
          {t('alerts.schedule-set-up')}
        </Alert>
        <TeamSwapper division={division} />
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
