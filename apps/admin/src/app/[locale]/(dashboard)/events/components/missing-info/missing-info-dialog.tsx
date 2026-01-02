'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  Chip
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { Division } from '@lems/types/api/admin';
import { MissingInfoItem, type MissingItem } from './missing-info-item';

interface MissingInfoDialogProps {
  open: boolean;
  onClose: () => void;
  divisions: Division[] | { id: string; name: string; color: string }[];
}

export const MissingInfoDialog: React.FC<MissingInfoDialogProps> = ({
  open,
  onClose,
  divisions
}) => {
  const t = useTranslations('pages.events.missing-info');
  const tCard = useTranslations('pages.events.card');
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('');

  const hasDetailedData = divisions.length > 0 && 'hasAwards' in divisions[0];

  useEffect(() => {
    if (open && hasDetailedData && divisions.length > 0) {
      setSelectedDivisionId(divisions[0].id);
    } else if (!open) {
      setSelectedDivisionId('');
    }
  }, [open, hasDetailedData, divisions]);

  const handleDivisionClick = (divisionId: string) => {
    setSelectedDivisionId(divisionId);
  };

  const getMissingItemsForDivision = (divisionId: string): MissingItem[] => {
    const missingItems: MissingItem[] = [];

    if (!hasDetailedData) return missingItems;

    const division = divisions.find(d => d.id === divisionId);
    if (!division) return missingItems;

    const fullDivision = division as Division;

    if (!fullDivision.hasAwards) {
      missingItems.push({ type: 'awards' });
    }
    if (!fullDivision.hasUsers) {
      missingItems.push({ type: 'users' });
    }
    if (!fullDivision.hasSchedule) {
      missingItems.push({ type: 'schedule' });
    }

    return missingItems;
  };

  const selectedDivision = divisions.find(d => d.id === selectedDivisionId);
  const missingItems = selectedDivisionId ? getMissingItemsForDivision(selectedDivisionId) : [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle>{t('dialog-title')}</DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 2, overflow: 'visible' }}>
        {!hasDetailedData ? (
          <Typography variant="body2" color="text.secondary">
            {tCard('missing-details')}
          </Typography>
        ) : (
          <Box>
            {divisions.length > 1 && (
              <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {divisions.map(division => (
                  <Chip
                    key={division.id}
                    label={division.name}
                    onClick={() => handleDivisionClick(division.id)}
                    variant={selectedDivisionId === division.id ? 'filled' : 'outlined'}
                    sx={{
                      backgroundColor:
                        selectedDivisionId === division.id ? `${division.color}40` : 'transparent',
                      borderColor: division.color,
                      color: selectedDivisionId === division.id ? 'white' : division.color,
                      '&:hover': {
                        backgroundColor: `${division.color}20`
                      }
                    }}
                  />
                ))}
              </Box>
            )}

            {selectedDivision && (
              <Box>
                {missingItems.length > 0 ? (
                  <List dense sx={{ py: 0 }}>
                    {missingItems.map((item, index) => (
                      <MissingInfoItem key={index} item={item} />
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="success.main" sx={{ fontStyle: 'italic' }}>
                    {t('division-fully-configured')}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('close')}</Button>
      </DialogActions>
    </Dialog>
  );
};
