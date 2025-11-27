'use client';

import { useTranslations } from 'next-intl';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Division } from '@lems/types/api/admin';

interface ViewPitMapDialogProps {
  open: boolean;
  onClose: () => void;
  division: Division;
}

export const ViewPitMapDialog = ({ open, onClose, division }: ViewPitMapDialogProps) => {
  const t = useTranslations('pages.events.venue.pit-map.view-dialog');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{t('current-map')}</DialogTitle>
      <DialogContent>
        {division.pitMapUrl && (
          <Box sx={{ textAlign: 'center' }}>
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
