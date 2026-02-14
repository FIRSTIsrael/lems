'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  MenuItem
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { Division } from '@lems/types/api/admin';

interface PitMapAreaDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; maxTeams: number; divisionId: string | null }) => void;
  divisions: Division[];
  selectedDivisionId?: string;
}

export const PitMapAreaDialog: React.FC<PitMapAreaDialogProps> = ({
  open,
  onClose,
  onSave,
  divisions,
  selectedDivisionId
}) => {
  const t = useTranslations('pages.events.pit-map.area-dialog');
  const [name, setName] = useState('');
  const [maxTeams, setMaxTeams] = useState(10);
  const [divisionId, setDivisionId] = useState<string>(selectedDivisionId || '');

  const handleSave = () => {
    if (!name.trim()) {
      return;
    }

    onSave({
      name: name.trim(),
      maxTeams,
      divisionId: divisionId || null
    });

    // Reset form
    setName('');
    setMaxTeams(10);
    setDivisionId(selectedDivisionId || '');
    onClose();
  };

  const handleClose = () => {
    // Reset form
    setName('');
    setMaxTeams(10);
    setDivisionId(selectedDivisionId || '');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('title')}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label={t('name-label')}
            value={name}
            onChange={e => setName(e.target.value)}
            fullWidth
            required
            autoFocus
            placeholder={t('name-placeholder')}
          />

          <TextField
            label={t('capacity-label')}
            type="number"
            value={maxTeams}
            onChange={e => setMaxTeams(Math.max(1, parseInt(e.target.value) || 1))}
            fullWidth
            required
            inputProps={{ min: 1 }}
            helperText={t('capacity-hint')}
          />

          {divisions.length > 1 && (
            <TextField
              select
              label={t('division-label')}
              value={divisionId}
              onChange={e => setDivisionId(e.target.value)}
              fullWidth
              helperText={t('division-hint')}
            >
              <MenuItem value="">{t('all-divisions')}</MenuItem>
              {divisions.map(division => (
                <MenuItem key={division.id} value={division.id}>
                  {division.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('cancel')}</Button>
        <Button onClick={handleSave} variant="contained" disabled={!name.trim()}>
          {t('save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
