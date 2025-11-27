'use client';

import React from 'react';
import { Box, Dialog, TextField, IconButton } from '@mui/material';
import { useTranslations } from 'next-intl';

interface TitleEditDialogProps {
  open: boolean;
  title: string;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const TitleEditDialog: React.FC<TitleEditDialogProps> = ({
  open,
  title,
  onTitleChange,
  onSave,
  onCancel
}) => {
  const t = useTranslations(`pages.events.schedule.calendar.agenda`);
  
  return (
    <Dialog open={open} onClose={onCancel}>
      <Box sx={{ p: 2, minWidth: 300 }}>
        <TextField
          fullWidth
          label={t('event-title')}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSave();
            } else if (e.key === 'Escape') {
              onCancel();
            }
          }}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <IconButton onClick={onCancel} size="small">
            {t('cancel')}
          </IconButton>
          <IconButton onClick={onSave} size="small" color="primary">
            {t('save')}
          </IconButton>
        </Box>
      </Box>
    </Dialog>
  );
};
