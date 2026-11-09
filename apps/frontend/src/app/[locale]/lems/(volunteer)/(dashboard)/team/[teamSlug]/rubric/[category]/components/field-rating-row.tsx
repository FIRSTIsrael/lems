'use client';

import { useTranslations } from 'next-intl';
import { IconButton } from '@mui/material';
import { JudgingCategory } from '@lems/types/judging';
import { useRubricsTranslations } from '@lems/localization';
import { getRubrics } from '@lems/shared/rubrics';
import { RubricFieldRows, type RubricCellValue } from '@lems/shared/rubrics/rubric-field-rows';
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

  const handleFieldChange = (cellValue: RubricCellValue) => {
    updateFieldValue(fieldId, cellValue).catch(() => {
      toast.error(t('toasts.rating-update-error'));
    });
  };

  return (
    <RubricFieldRows
      id={`field-${fieldId}`}
      criterion={isCriteria ? getFieldCriterion(sectionId, fieldId) : undefined}
      getLevelLabel={level => getFieldLevel(sectionId, fieldId, level)}
      renderControl={cellValue => (
        <IconButton
          disabled={disabled}
          disableRipple
          size="small"
          onClick={() => handleFieldChange(cellValue)}
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
