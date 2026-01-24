'use client';

import { useTranslations } from 'next-intl';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { Division } from '@lems/types/api/admin';

interface ViewPitMapDialogProps {
  open: boolean;
  onClose: () => void;
  division: Division;
  onDelete?: () => void;
}

export const ViewPitMapDialog = ({ open, onClose, division, onDelete }: ViewPitMapDialogProps) => {
  const t = useTranslations('pages.events.venue.pit-map.view-dialog');
  const tDelete = useTranslations('pages.events.venue.pit-map');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {t('current-map')}
        <Tooltip title={tDelete('delete-button')}>
          <IconButton
            onClick={() => {
              onDelete?.();
              onClose();
            }}
            color="error"
            size="small"
          >
            <Delete />
          </IconButton>
        </Tooltip>
      </DialogTitle>
      <DialogContent>
        {division.pitMapUrl && (
          <Box sx={{ textAlign: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={division.pitMapUrl}
              alt="Pit Map"
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain'
              }}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('close')}</Button>
      </DialogActions>
    </Dialog>
  );
};
