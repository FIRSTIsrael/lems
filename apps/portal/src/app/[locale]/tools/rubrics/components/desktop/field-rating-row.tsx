'use client';

import { IconButton } from '@mui/material';
import { JudgingCategory } from '@lems/types/judging';
import { useRubricsTranslations } from '@lems/localization';
import { getRubrics } from '@lems/shared/rubrics';
import { RubricFieldRows, type RubricCellValue } from '@lems/shared/rubrics/rubric-field-rows';
import { useToolEdition } from '../../../hooks/use-tool-edition';
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
  const edition = useToolEdition();
  const { getFieldLevel, getFieldCriterion } = useRubricsTranslations(category, edition);
  const isCriteria = getRubrics(edition)[category].layout === 'criteria';
  const { rubric, updateRubric } = useRubricContext();

  const currentValue = rubric.values.fields[fieldId]?.value;

  const handleFieldUpdate = async (value: RubricCellValue) => {
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
    <RubricFieldRows
      criterion={isCriteria ? getFieldCriterion(sectionId, fieldId) : undefined}
      getLevelLabel={level => getFieldLevel(sectionId, fieldId, level)}
      cellSx={{ '@media print': { fontSize: '0.875em', p: '0.5em' } }}
      renderControl={cellValue => (
        <IconButton
          disabled={disabled}
          disableRipple
          size="small"
          onClick={() => handleFieldUpdate(cellValue)}
          sx={{ p: '0.5em', flexShrink: 0, '&:hover': { backgroundColor: 'transparent' } }}
        >
          <RubricRadioIcon
            checked={currentValue === cellValue}
            isCoreValues={coreValues}
            sx={{ fontSize: '1.5em' }}
          />
        </IconButton>
      )}
    />
  );
};
