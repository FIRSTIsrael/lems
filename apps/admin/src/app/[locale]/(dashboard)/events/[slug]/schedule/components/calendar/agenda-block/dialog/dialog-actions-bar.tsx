'use client';

import React from 'react';
import { Button } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslations } from 'next-intl';

interface DialogActionsBarProps {
  size: 'normal' | 'small' | 'tiny';
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export const DialogActionsBar: React.FC<DialogActionsBarProps> = ({
  size,
  onSave,
  onCancel,
  onDelete
}) => {
  const t = useTranslations(`pages.events.schedule.calendar.agenda`);
  const showDeleteButton = size !== 'normal' && onDelete;

  return (
    <>
      {showDeleteButton && (
        <Button
          onClick={onDelete}
          startIcon={<DeleteIcon />}
          color="error"
          variant="text"
          size="small"
          sx={{ mr: 'auto' }}
        >
          {t('delete')}
        </Button>
      )}
      <Button onClick={onCancel} variant="text" size="small">
        {t('cancel')}
      </Button>
      <Button onClick={onSave} variant="contained" size="small" color="primary">
        {t('save')}
      </Button>
    </>
  );
};
