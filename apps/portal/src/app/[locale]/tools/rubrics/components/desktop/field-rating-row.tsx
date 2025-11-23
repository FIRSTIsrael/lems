'use client';

import { TableRow, TableCell, Typography, IconButton, Stack } from '@mui/material';
import { JudgingCategory } from '@lems/types';
import { useRubricsTranslations } from '@lems/localization';
import { rubricColumns } from '@lems/shared/rubrics';
import { useRubricContext } from '../rubric-context';
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
  const { rubric, updateRubric } = useRubricContext();

  const currentValue = rubric.values.fields[fieldId]?.value;

  const handleFieldUpdate = async (value: 1 | 2 | 3 | 4) => {
    const updatedValues = {
      ...rubric.values,
      fields: {
        ...rubric.values.fields,
        [fieldId]: {
          ...rubric.values.fields[fieldId],
          value
        }
      }
    };

    await updateRubric(updatedValues);
  };

  return (
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
              alignItems="center"
              justifyContent={label ? 'flex-start' : 'center'}
            >
              <IconButton
                disabled={disabled}
                disableRipple
                size="small"
                onClick={() => handleFieldUpdate(cellValue)}
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
  );
};
