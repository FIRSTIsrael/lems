'use client';

import React, { useState } from 'react';
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
import { useFormikContext } from 'formik';
import { JudgingCategory } from '@lems/types';
import { rubricColumns } from '@lems/shared/rubrics';
import { useRubricsTranslations } from '@lems/localization';
import { RubricFormValues } from '../../rubric-types';
import { RubricRadioIcon } from '../desktop/rubric-radio-icon';

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
  const [expanded, setExpanded] = useState(false);
  const { getFieldLevel } = useRubricsTranslations(category);
  const { values, setFieldValue } = useFormikContext<RubricFormValues>();
  const currentValue = values.fields[fieldId]?.value;

  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader
        title={
          <Typography variant="subtitle1" fontWeight={600}>
            {getFieldLevel(sectionId, fieldId, 'beginning')}
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
              row
              value={currentValue}
              onChange={e =>
                setFieldValue(`fields.${fieldId}`, {
                  value: parseInt(e.target.value)
                })
              }
            >
              {rubricColumns.map((level, index) => {
                const cellValue = (index + 1) as 1 | 2 | 3 | 4;
                const label =
                  level === 'exceeds'
                    ? rubricColumns[index]
                    : getFieldLevel(sectionId, fieldId, level);

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
                rows={3}
                label="Notes"
                fullWidth
                disabled={disabled}
                value={values.fields[fieldId]?.notes ?? ''}
                onChange={e =>
                  setFieldValue(`fields.${fieldId}`, {
                    ...values.fields[fieldId],
                    notes: e.target.value
                  })
                }
                size="small"
              />
            )}
          </Stack>
        </CardContent>
      </Collapse>
    </Card>
  );
};
