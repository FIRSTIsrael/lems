import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useTranslations } from 'next-intl';

export const ImportTeamButton: React.FC = () => {
  const t = useTranslations('pages.teams');

  return (
    <Tooltip title={t('import-teams')}>
      <span>
        <IconButton color="primary" disabled>
          <UploadFileIcon />
        </IconButton>
      </span>
    </Tooltip>
  );
};
