'use client';

import { useTranslations } from 'next-intl';
import { TableRow, TableCell, TextField, Box, Typography } from '@mui/material';
import { useRubricContext } from '../rubric-context';

interface FieldNotesRowProps {
  fieldId: string;
  disabled?: boolean;
}

export const FieldNotesRow: React.FC<FieldNotesRowProps> = ({ fieldId, disabled = false }) => {
  const t = useTranslations('pages.tools.rubrics');
  const { rubric, updateRubric } = useRubricContext();

  const handleNotesUpdate = async (notes: string) => {
    const updatedValues = {
      ...rubric.values,
      fields: {
        ...rubric.values.fields,
        [fieldId]: {
          ...rubric.values.fields[fieldId],
          notes
        }
      }
    };

    await updateRubric(updatedValues);
  };

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
          py: 1,
          '@media print': {
            backgroundColor: 'rgba(0,0,0,0.03)',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact'
          }
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
            value={rubric.values.fields[fieldId]?.notes ?? ''}
            onChange={e => handleNotesUpdate(e.target.value)}
          />
        </Box>
      </TableCell>
    </TableRow>
  );
};
