import { KeyboardEventHandler, useRef } from 'react';
import { Field, FieldProps } from 'formik';
import { TableCell, Typography, TableRow, Box, TextField } from '@mui/material';

interface ExceededNotesCellProps {
  name: string;
  placeholder?: string;
  disabled?: boolean;
  blurOnEsc?: boolean;
}

const ExceededNotesCell: React.FC<ExceededNotesCellProps> = ({
  name,
  placeholder,
  disabled,
  blurOnEsc
}) => {
  const textFieldRef = useRef<HTMLInputElement>(null);

  const handleKeyDown: KeyboardEventHandler = e => {
    if (blurOnEsc && e.key === 'Escape') {
      textFieldRef.current?.blur();
    }
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
          backgroundColor: '#f1f1f1',
          py: 1,
          '@media print': {
            backgroundColor: '#f1f1f1',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact'
          }
        }}
      >
        <Field name={`${name}.notes`}>
          {({
            field: { onBlur: fieldOnBlur, ...field },
            form,
            meta: { error, touched }
          }: FieldProps) => (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography
                sx={{
                  fontWeight: 500,
                  lineHeight: 1.4375,
                  mr: 0.75,
                  color: error && touched ? 'red' : 'rgba(0,0,0,0.6)'
                }}
              >
                נימוק:
              </Typography>
              <TextField
                inputRef={textFieldRef}
                onBlur={e => fieldOnBlur(e ?? field.name)}
                disabled={disabled || form.isSubmitting}
                fullWidth
                spellCheck
                multiline
                variant="standard"
                placeholder={placeholder || 'כיצד הקבוצה התבלטה כמצטיינת?'}
                slotProps={{ input: { disableUnderline: true } }}
                {...field}
                onChange={e => form.setFieldValue(field.name, e.target.value, false)}
                onKeyDown={handleKeyDown}
              />
            </Box>
          )}
        </Field>
      </TableCell>
    </TableRow>
  );
};

export default ExceededNotesCell;
