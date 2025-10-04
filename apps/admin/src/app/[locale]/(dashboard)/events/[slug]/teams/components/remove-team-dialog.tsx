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
import { TeamWithDivision } from '@lems/types/api/admin';
import { apiFetch } from '@lems/shared';
import { useEvent } from '../../components/event-context';

interface RemoveTeamDialogProps {
  team: TeamWithDivision;
  open: boolean;
  onClose: () => void;
}

export const RemoveTeamDialog: React.FC<RemoveTeamDialogProps> = ({ team, open, onClose }) => {
  const t = useTranslations('pages.events.teams.remove-dialog');
  const event = useEvent();

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRemoveTeam = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const response = await apiFetch(`/admin/events/${event.id}/teams/remove`, {
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
            onClick={handleRemoveTeam}
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
