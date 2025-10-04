'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { mutate } from 'swr';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  Collapse
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { Event, TeamWithDivision } from '@lems/types/api/admin';
import { apiFetch } from '@lems/shared';

interface UnregisterTeamDialogProps {
  team: TeamWithDivision;
  event: Event;
  open: boolean;
  onClose: () => void;
}

export const UnregisterTeamDialog: React.FC<UnregisterTeamDialogProps> = ({
  team,
  event,
  open,
  onClose
}) => {
  const t = useTranslations('pages.events.teams.unregister-dialog');

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteSchedule = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const response = await apiFetch(`/admin/events/${event.id}/teams/unregister`, {
        method: 'DELETE',
        body: JSON.stringify([team.id]),
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        await Promise.all([
          mutate(`/admin/events/${event.id}/teams`),
          mutate(`/admin/events/${event.id}/teams/available`)
        ]);
        onClose();
      } else {
        throw new Error(String(response.error));
      }
    } catch (err) {
      setError(t('error'));
      console.error('Error deleting team:', String(err));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t('title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('message', { number: team.number })}</DialogContentText>
          <Collapse in={!!error}>
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          </Collapse>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isDeleting}>
            {t('cancel')}
          </Button>
          <Button
            onClick={handleDeleteSchedule}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={18} /> : <Delete />}
          >
            {isDeleting ? t('deleting') : t('confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
