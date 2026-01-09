'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogTitle, DialogContent, DialogActions, Stack, useTheme } from '@mui/material';
import { AgendaBlockVisibility, type AgendaBlock } from '../../calendar-types';
import { useCalendar } from '../../calendar-context';
import { TitleField } from './title-field';
import { LocationField } from './location-field';
import { VisibilitySection } from './visibility-section';
import { DialogActionsBar } from './dialog-actions-bar';

interface EditAgendaDialogProps {
  open: boolean;
  blockId: string;
  onSave: (title: string, location: string | null, visibility: AgendaBlockVisibility) => void;
  onCancel: () => void;
  onDelete: () => void;
  size: 'normal' | 'small' | 'tiny';
}

export const EditAgendaDialog: React.FC<EditAgendaDialogProps> = ({
  open,
  blockId,
  onSave,
  onCancel,
  onDelete,
  size
}) => {
  const t = useTranslations(`pages.events.schedule.calendar.agenda`);
  const theme = useTheme();

  const { blocks } = useCalendar();

  const block = blocks.agenda.find(b => b.id === blockId) as AgendaBlock | undefined;
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<AgendaBlockVisibility>('public');

  useEffect(() => {
    if (block && open) {
      // Sync with external state -> this is OK.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(block.title || '');
      setLocation(block.location);
      setVisibility(block.visibilty ?? 'public');
    }
  }, [block, open]);

  const handleSave = () => {
    onSave(title, location, visibility);
  };

  const handleCancel = () => {
    if (block) {
      setTitle(block.title || '');
      setLocation(block.location);
      setVisibility(block.visibilty ?? 'public');
    }
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      onMouseDown={e => e.stopPropagation()}
      onMouseUp={e => e.stopPropagation()}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2
          }
        }
      }}
    >
      <DialogTitle
        key="header"
        sx={{
          fontSize: '1.25rem',
          fontWeight: 600,
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: 2,
          pt: 2.5,
          px: 3
        }}
      >
        {t('edit-event')}
      </DialogTitle>

      <DialogContent key="body" sx={{ pt: 3, px: 3 }}>
        <Stack spacing={3} mt={3}>
          <TitleField value={title} onChange={setTitle} onKeyDown={handleKeyDown} />
          <LocationField value={location} onChange={setLocation} onKeyDown={handleKeyDown} />
          <VisibilitySection value={visibility} onChange={setVisibility} />
        </Stack>
      </DialogContent>

      <DialogActions
        key="footer"
        sx={{
          p: 2,
          px: 3,
          borderTop: `1px solid ${theme.palette.divider}`,
          gap: 1,
          justifyContent: size === 'normal' ? 'flex-end' : 'space-between'
        }}
      >
        <DialogActionsBar
          size={size}
          onSave={handleSave}
          onCancel={handleCancel}
          onDelete={onDelete}
        />
      </DialogActions>
    </Dialog>
  );
};
