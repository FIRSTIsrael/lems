'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Team } from '@lems/types/api/admin';
import { TeamForm } from './team-form';

interface UpdateTeamDialogProps {
  team: Team;
  open: boolean;
  onClose: () => void;
}

export const UpdateTeamDialog: React.FC<UpdateTeamDialogProps> = ({ team, open, onClose }) => {
  const t = useTranslations('pages.teams.update-dialog');

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t('title', { number: team.number })}</DialogTitle>
        <DialogContent>
          <TeamForm
            route={`/admin/teams/${team.id}`}
            onSuccess={onClose}
            team={{ ...team, number: String(team.number) }}
            isEditing={true}
            method="PATCH"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('cancel')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
