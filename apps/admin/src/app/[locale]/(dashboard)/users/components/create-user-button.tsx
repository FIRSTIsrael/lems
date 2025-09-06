'use client';

import { useTranslations } from 'next-intl';
import { IconButton, Tooltip } from '@mui/material';
import { AddRounded } from '@mui/icons-material';
import { useDialog } from '../../components/dialog-provider';
import { CreateUserDialog } from './create-user-dialog';

export const CreateUserButton = () => {
  const t = useTranslations('pages.users');
  const { showDialog } = useDialog();

  const showCreationDialog = () => {
    showDialog(CreateUserDialog);
  };

  return (
    <Tooltip title={t('create-new-user')}>
      <IconButton onClick={showCreationDialog} size="medium">
        <AddRounded />
      </IconButton>
    </Tooltip>
  );
};
