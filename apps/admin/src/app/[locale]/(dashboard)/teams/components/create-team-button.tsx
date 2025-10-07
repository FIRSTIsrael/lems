'use client';

import { useTranslations } from 'next-intl';
import { IconButton, Tooltip } from '@mui/material';
import { AddRounded } from '@mui/icons-material';
import { useDialog } from '../../components/dialog-provider';
import { CreateTeamDialog } from './create-team-dialog';

export const CreateTeamButton = () => {
  const t = useTranslations('pages.teams');
  const { showDialog } = useDialog();

  const showCreationDialog = () => {
    showDialog(CreateTeamDialog);
  };

  return (
    <Tooltip title={t('create-new-team')}>
      <IconButton onClick={showCreationDialog} size="medium">
        <AddRounded />
      </IconButton>
    </Tooltip>
  );
};
