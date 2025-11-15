'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { DialogComponentProps } from '../../components/dialog-provider';
import { TeamForm } from './team-form';

export const CreateTeamDialog: React.FC<DialogComponentProps> = ({ close }) => {
  const t = useTranslations('pages.teams.creation-dialog');

  return (
    <>
      <DialogTitle>{t('title')}</DialogTitle>
      <DialogContent>
        <TeamForm onSuccess={close} route="/admin/teams" method="POST" />
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>{t('actions.cancel')}</Button>
      </DialogActions>
    </>
  );
};
