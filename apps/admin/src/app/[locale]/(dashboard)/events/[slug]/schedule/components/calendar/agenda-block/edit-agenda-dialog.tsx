'use client';

import React from 'react';
import { Box, Dialog, TextField, IconButton, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { AgendaBlockVisibility } from '../calendar-types';

interface EditAgendaDialogProps {
  open: boolean;
  title: string;
  visibility: AgendaBlockVisibility;
  onTitleChange: (title: string) => void;
  onVisibilityChange: (visibility: AgendaBlockVisibility) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: (e: React.MouseEvent) => void;
  size: 'normal' | 'small' | 'tiny';
}

export const EditAgendaDialog: React.FC<EditAgendaDialogProps> = ({
  open,
  title,
  visibility,
  onTitleChange,
  onVisibilityChange,
  onSave,
  onCancel,
  onDelete,
  size
}) => {
  const t = useTranslations(`pages.events.schedule.calendar.agenda`);
  
  return (
    <Dialog open={open} onClose={onCancel}>
      <Box sx={{ p: 2, minWidth: 350 }}>
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
          sx={{ mb: 3 }}
        />
        
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend">{t('visibility')}</FormLabel>
          <RadioGroup
            value={visibility}
            onChange={(e) => onVisibilityChange(e.target.value as AgendaBlockVisibility)}
          >
            <FormControlLabel
              value="public"
              control={<Radio />}
              label={
                <Box sx={{ p: 2 }}>
                  <Typography variant="body2">{t('public')}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {t('description-public')}
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="field"
              control={<Radio />}
              label={
                <Box sx={{ p: 2 }}>
                  <Typography variant="body2">{t('field')}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {t('description-field')}
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="judging"
              control={<Radio />}
              label={
                <Box sx={{ p: 2 }}>
                  <Typography variant="body2">{t('judging')}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {t('description-judging')}
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>
        </FormControl>
        
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          { size !== 'normal' &&
            <IconButton onClick={onDelete} size="small" color='error'>
              {t('delete')}
            </IconButton>
          }
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
