'use client';

import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useTranslations } from 'next-intl';
import { useDialog } from '../../components/dialog-provider';
import { ImportTeamDialog } from './import-team-dialog';

export const ImportTeamButton: React.FC = () => {
  const t = useTranslations('pages.teams');
  const { showDialog } = useDialog();

  const showImportDialog = () => {
    showDialog(ImportTeamDialog);
  };

  return (
    <Tooltip title={t('import-teams')}>
      <IconButton onClick={showImportDialog}>
        <UploadFileIcon />
      </IconButton>
    </Tooltip>
  );
};
