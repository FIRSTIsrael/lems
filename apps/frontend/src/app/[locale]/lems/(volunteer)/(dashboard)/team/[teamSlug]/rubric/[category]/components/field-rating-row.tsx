'use client';

import { TableRow, TableCell, Typography, IconButton, Stack } from '@mui/material';
import { Field, FieldProps, useFormikContext } from 'formik';
import { JudgingCategory } from '@lems/types/judging';
import { useRubricsTranslations } from '@lems/localization';
import { rubricColumns } from '@lems/shared/rubrics';
import type { RubricFormValues } from '../rubric-utils';
import { RubricRadioIcon } from './rubric-radio-icon';

interface FieldRatingRowProps {
  category: JudgingCategory;
  fieldId: string;
  sectionId: string;
  coreValues?: boolean;
  disabled?: boolean;
}

export const FieldRatingRow: React.FC<FieldRatingRowProps> = ({
  category,
  fieldId,
  sectionId,
  coreValues = false,
  disabled = false
}) => {
  const { getFieldLevel } = useRubricsTranslations(category);
  const { values } = useFormikContext<RubricFormValues>();
  const currentValue = values.fields[fieldId]?.value;

  return (
    <Field name={fieldId}>
      {({ form }: FieldProps) => (
        <TableRow>
          {rubricColumns.map((level, levelIndex) => {
            const cellValue = (levelIndex + 1) as 1 | 2 | 3 | 4;
            const label = level === 'exceeds' ? null : getFieldLevel(sectionId, fieldId, level);
            const isChecked = currentValue === cellValue;

            return (
              <TableCell
                key={level}
                align={label ? 'left' : 'center'}
                sx={{
                  borderTop: '1px solid #000',
                  borderRight: '1px solid rgba(0,0,0,0.2)',
                  borderLeft: '1px solid rgba(0,0,0,0.2)',
                  borderBottom: 'none',
                  fontSize: '1em',
                  p: '0.75em',
                  pr: '0.5em',
                  pl: '0.25em',
                  backgroundColor: '#fff',
                  '@media print': {
                    fontSize: '0.875em',
                    p: '0.5em'
                  }
                }}
              >
                <Stack
                  spacing={0.5}
                  direction="row"
                  alignItems={label ? 'flex-start' : 'center'}
                  justifyContent="center"
                >
                  <IconButton
                    disabled={disabled || form.isSubmitting}
                    disableRipple
                    size="small"
                    onClick={() => form.setFieldValue(`fields.${fieldId}`, { value: cellValue })}
                    sx={{
                      p: '0.5em',
                      flexShrink: 0,
                      '&:hover': {
                        backgroundColor: 'transparent'
                      }
                    }}
                  >
                    <RubricRadioIcon
                      checked={isChecked}
                      isCoreValues={coreValues}
                      sx={{ fontSize: '1.5em' }}
                    />
                  </IconButton>
                  {label && (
                    <Typography fontSize="0.875em" sx={{ pt: '0.25em' }}>
                      {label}
                    </Typography>
                  )}
                </Stack>
              </TableCell>
            );
          })}
        </TableRow>
      )}
    </Field>
  );
};
