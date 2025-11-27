'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardHeader,
  Collapse,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Typography,
  Stack
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
import { JudgingCategory } from '@lems/types/judging';
import { rubricColumns } from '@lems/shared/rubrics';
import { useRubricsGeneralTranslations, useRubricsTranslations } from '@lems/localization';
import { RubricRadioIcon } from '../desktop/rubric-radio-icon';
import { useRubricContext } from '../rubric-context';

interface MobileFieldSectionProps {
  category: JudgingCategory;
  sectionId: string;
  fieldId: string;
  coreValues?: boolean;
  disabled?: boolean;
}

export const MobileFieldSection: React.FC<MobileFieldSectionProps> = ({
  category,
  sectionId,
  fieldId,
  coreValues = false,
  disabled = false
}) => {
  const t = useTranslations('pages.tools.rubrics');
  const [expanded, setExpanded] = useState(false);
  const { getFieldLevel } = useRubricsTranslations(category);
  const { getColumnTitle } = useRubricsGeneralTranslations();
  const { rubric, updateRubric } = useRubricContext();
  const currentValue = rubric.values.fields[fieldId]?.value;

  const getCurrentLevelLabel = () => {
    if (!currentValue) return t('mobile-placeholder');

    const levelIndex = currentValue - 1;
    const levelMap = ['beginning', 'developing', 'accomplished', 'exceeds'] as const;
    return getColumnTitle(levelMap[levelIndex]);
  };

  const handleFieldChange = async (value: 1 | 2 | 3 | 4) => {
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

  const handleNotesChange = async (notes: string) => {
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
    <Card sx={{ mb: 2 }}>
      <CardHeader
        title={
          <Typography variant="subtitle1" fontWeight={600}>
            {getCurrentLevelLabel()}
          </Typography>
        }
        action={
          <IconButton onClick={() => setExpanded(!expanded)} size="small" sx={{ ml: 1 }}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        }
      />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Stack spacing={2}>
            <RadioGroup
              value={currentValue || ''}
              onChange={e => handleFieldChange(parseInt(e.target.value) as 1 | 2 | 3 | 4)}
            >
              {rubricColumns.map((level, index) => {
                const cellValue = (index + 1) as 1 | 2 | 3 | 4;
                const label = level === 'exceeds' ? null : getFieldLevel(sectionId, fieldId, level);

                return (
                  <FormControlLabel
                    key={cellValue}
                    value={cellValue}
                    control={
                      <Radio
                        disabled={disabled}
                        icon={<RubricRadioIcon checked={false} isCoreValues={coreValues} />}
                        checkedIcon={<RubricRadioIcon checked={true} isCoreValues={coreValues} />}
                      />
                    }
                    label={
                      <Typography variant="caption" sx={{ ml: 1 }}>
                        {label}
                      </Typography>
                    }
                  />
                );
              })}
            </RadioGroup>

            {currentValue === 4 && (
              <TextField
                multiline
                rows={4}
                label={t('field-notes-label')}
                placeholder={t('field-notes-placeholder')}
                fullWidth
                disabled={disabled}
                value={rubric.values.fields[fieldId]?.notes ?? ''}
                onChange={e => handleNotesChange(e.target.value)}
                onBlur={e => handleNotesChange(e.target.value)}
                size="small"
                sx={{
                  mt: 2,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.paper'
                  }
                }}
              />
            )}
          </Stack>
        </CardContent>
      </Collapse>
    </Card>
  );
};
