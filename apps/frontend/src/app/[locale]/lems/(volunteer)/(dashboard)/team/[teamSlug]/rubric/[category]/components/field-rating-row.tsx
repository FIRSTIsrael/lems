'use client';

import { useTranslations } from 'next-intl';
import { TableRow, TableCell, Typography, IconButton, Stack } from '@mui/material';
import { JudgingCategory } from '@lems/types/judging';
import { useRubricsTranslations } from '@lems/localization';
import { getRubrics, rubricColumns } from '@lems/shared/rubrics';
import toast from 'react-hot-toast';
import { useEdition } from '../../../../../../hooks/use-edition';
import { useRubric } from '../rubric-context';
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
  const t = useTranslations('pages.rubric');
  const edition = useEdition();
  const { getFieldLevel, getFieldCriterion } = useRubricsTranslations(category, edition);
  const isCriteria = getRubrics(edition)[category].layout === 'criteria';

  const { rubric, updateFieldValue } = useRubric();
  const currentValue = rubric.data?.fields?.[fieldId]?.value;

  const handleFieldChange = (cellValue: 1 | 2 | 3 | 4) => {
    updateFieldValue(fieldId, cellValue).catch(() => {
      toast.error(t('toasts.rating-update-error'));
    });
  };

  return (
    <>
      {isCriteria && (
        <TableRow id={`field-${fieldId}`}>
          <TableCell
            colSpan={4}
            sx={{
              borderTop: '1px solid #000',
              borderBottom: 'none',
              backgroundColor: '#fff',
              px: '1em',
              pt: '0.75em',
              pb: 0
            }}
          >
            <Typography sx={{ fontSize: '0.95em', fontWeight: 500 }}>
              {getFieldCriterion(sectionId, fieldId)}
            </Typography>
          </TableCell>
        </TableRow>
      )}
      <TableRow id={isCriteria ? undefined : `field-${fieldId}`}>
        {rubricColumns.map((level, levelIndex) => {
          const cellValue = (levelIndex + 1) as 1 | 2 | 3 | 4;
          const label =
            isCriteria || level === 'exceeds' ? null : getFieldLevel(sectionId, fieldId, level);
          const isChecked = currentValue === cellValue;

          return (
            <TableCell
              key={level}
              align={label ? 'left' : 'center'}
              sx={{
                borderTop: isCriteria ? 'none' : '1px solid #000',
                borderRight: '1px solid rgba(0,0,0,0.2)',
                borderLeft: '1px solid rgba(0,0,0,0.2)',
                borderBottom: 'none',
                fontSize: '1em',
                p: '0.75em',
                pr: '0.5em',
                pl: '0.25em',
                backgroundColor: '#fff'
              }}
            >
              <Stack
                spacing={0.5}
                direction="row"
                sx={{
                  alignItems: 'center',
                  justifyContent: label ? 'flex-start' : 'center'
                }}
              >
                <IconButton
                  disabled={disabled}
                  disableRipple
                  size="small"
                  onClick={() => handleFieldChange(cellValue)}
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
                  <Typography
                    sx={{
                      fontSize: '0.875em',
                      pt: '0.25em'
                    }}
                  >
                    {label}
                  </Typography>
                )}
              </Stack>
            </TableCell>
          );
        })}
      </TableRow>
    </>
  );
};
