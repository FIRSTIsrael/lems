'use client';

import { TableRow, TableCell, Typography, IconButton, Stack } from '@mui/material';
import { JudgingCategory } from '@lems/types';
import { useRubricsTranslations } from '@lems/localization';
import { rubricColumns } from '@lems/shared/rubrics';
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

  return (
    <TableRow>
      {rubricColumns.map(level => {
        const label = level === 'exceeds' ? null : getFieldLevel(sectionId, fieldId, level);

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
            <Stack spacing={0.5} direction="row" alignItems="center" justifyContent="center">
              <IconButton
                disabled={disabled}
                disableRipple
                size="small"
                sx={{
                  p: '0.5em',
                  flexShrink: 0,
                  '&:hover': {
                    backgroundColor: 'transparent'
                  }
                }}
              >
                <RubricRadioIcon
                  checked={false}
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
