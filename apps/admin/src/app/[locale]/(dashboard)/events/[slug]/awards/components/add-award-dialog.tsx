'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useLocaleAwardName } from '@lems/shared/locale';
import { Award } from '../types';

interface AddAwardDialogProps {
  open: boolean;
  options: Award[];
  onAdd: (award: Award) => void;
  onClose: () => void;
}

export const AddAwardDialog: React.FC<AddAwardDialogProps> = ({
  open,
  options,
  onAdd,
  onClose
}) => {
  const t = useTranslations('pages.events.awards.editor.add-dialog');
  const getAwardName = useLocaleAwardName();
  const [selectedAward, setSelectedAward] = useState<Award | ''>('');

  const handleAddAward = () => {
    if (!selectedAward) return;
    onAdd(selectedAward);
    setSelectedAward('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('title')}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>{t('select-award')}</InputLabel>
          <Select
            value={selectedAward}
            onChange={e => setSelectedAward(e.target.value as Award)}
            label={t('select-award')}
          >
            {options.map(award => (
              <MenuItem key={award} value={award}>
                <Typography variant="body1">{getAwardName(award)}</Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('cancel')}</Button>
        <Button onClick={handleAddAward} variant="contained" disabled={!selectedAward}>
          {t('add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
