'use client';

import { useTranslations } from 'next-intl';
import { TableRow, TableCell, TextField, Box, Typography } from '@mui/material';
import { useCallback, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useRubric } from '../rubric-context';

interface FieldNotesRowProps {
  fieldId: string;
  disabled?: boolean;
}

export const FieldNotesRow: React.FC<FieldNotesRowProps> = ({ fieldId, disabled = false }) => {
  const t = useTranslations('pages.rubric');

  const { fieldValues, updateFieldValue } = useRubric();
  const currentValue = fieldValues.get(fieldId)?.value || 4;
  const contextNotes = fieldValues.get(fieldId)?.notes || '';

  const [notes, setNotes] = useState(contextNotes);

  useEffect(() => {
    setNotes(contextNotes);
  }, [contextNotes]);

  const handleNotesBlur = useCallback(() => {
    // Only send mutation if value changed from context
    if (notes !== contextNotes) {
      updateFieldValue(fieldId, currentValue, notes).catch(err => {
        console.error(`[FieldNotesRow] Failed to update notes for field ${fieldId}:`, err);
        toast.error(t('toasts.notes-update-error'));
      });
    }
  }, [fieldId, currentValue, notes, contextNotes, updateFieldValue, t]);

  return (
    <TableRow>
      <TableCell
        colSpan={4}
        sx={{
          borderTop: '1px solid rgba(0,0,0,0.2)',
          borderRight: '1px solid rgba(0,0,0,0.2)',
          borderLeft: '1px solid rgba(0,0,0,0.2)',
          borderBottom: 'none',
          backgroundColor: 'rgba(0,0,0,0.03)',
          py: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            sx={{
              fontWeight: 500,
              lineHeight: 1.4375,
              mr: 0.75,
              color: 'rgba(0,0,0,0.6)'
            }}
          >
            {t('field-notes-label')}:
          </Typography>
          <TextField
            disabled={disabled}
            fullWidth
            spellCheck
            multiline
            variant="standard"
            placeholder={t('field-notes-placeholder')}
            slotProps={{ input: { disableUnderline: true } }}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
          />
        </Box>
      </TableCell>
    </TableRow>
  );
};
