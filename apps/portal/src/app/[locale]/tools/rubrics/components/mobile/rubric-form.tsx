'use client';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Stack,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Paper,
  Button
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
import { Formik, Form, useFormikContext } from 'formik';
import { JudgingCategory } from '@lems/types';
import { rubrics, rubricColumns } from '@lems/shared/rubrics';
import { useRubricsTranslations, useRubricsGeneralTranslations } from '@lems/localization';
import { RubricFormValues } from '../../types/rubric-types';
import { getEmptyRubric } from '../../utils/rubric-utils';
import { getCategoryColor } from '../../utils/category-colors';
import { RubricRadioIcon } from '../desktop/rubric-radio-icon';

interface MobileFieldSectionProps {
  category: JudgingCategory;
  sectionId: string;
  fieldId: string;
  coreValues?: boolean;
  disabled?: boolean;
}

const MobileFieldSection: React.FC<MobileFieldSectionProps> = ({
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

interface MobileSectionProps {
  category: JudgingCategory;
  sectionId: string;
  fields: { id: string; coreValues?: boolean }[];
  disabled?: boolean;
}

const MobileSection: React.FC<MobileSectionProps> = ({
  category,
  sectionId,
  fields,
  disabled = false
}) => {
  const [expanded, setExpanded] = useState(true);
  const { getSectionTitle } = useRubricsTranslations(category);
  const categoryColor = getCategoryColor(category, 'light');
  const categoryDarkColor = getCategoryColor(category, 'dark');

  return (
    <Card
      sx={{
        mb: 3,
        borderTop: `3px solid ${categoryDarkColor}`,
        boxShadow: 1,
        backgroundColor: `${categoryColor}10`,
        transition: 'all 0.2s ease'
      }}
    >
      <CardHeader
        title={
          <Typography variant="h6" fontWeight={700} sx={{ color: categoryDarkColor }}>
            {getSectionTitle(sectionId)}
          </Typography>
        }
        sx={{
          backgroundColor: `${categoryColor}25`,
          borderBottom: `1px solid ${categoryColor}40`
        }}
        action={
          <IconButton onClick={() => setExpanded(!expanded)} size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        }
      />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Stack spacing={2}>
            {fields.map(field => (
              <MobileFieldSection
                key={field.id}
                category={category}
                sectionId={sectionId}
                fieldId={field.id}
                coreValues={field.coreValues}
                disabled={disabled}
              />
            ))}
          </Stack>
        </CardContent>
      </Collapse>
    </Card>
  );
};

interface MobileFeedbackProps {
  category: JudgingCategory;
  disabled?: boolean;
}

const MobileFeedback: React.FC<MobileFeedbackProps> = ({ category, disabled = false }) => {
  const { getFeedbackTitle } = useRubricsGeneralTranslations();
  const { values, setFieldValue } = useFormikContext<RubricFormValues>();
  const feedbackFields = ['great-job', 'think-about'] as const;
  const categoryColor = getCategoryColor(category, 'light');
  const categoryDarkColor = getCategoryColor(category, 'dark');

  return (
    <Card
      sx={{
        mb: 3,
        borderTop: `3px solid ${categoryDarkColor}`,
        boxShadow: 1,
        backgroundColor: `${categoryColor}10`,
        transition: 'all 0.2s ease'
      }}
    >
      <CardHeader
        title={
          <Typography variant="h6" fontWeight={700} sx={{ color: categoryDarkColor }}>
            Feedback
          </Typography>
        }
        sx={{
          backgroundColor: `${categoryColor}25`,
          borderBottom: `1px solid ${categoryColor}40`
        }}
      />
      <CardContent>
        <Stack spacing={2}>
          {feedbackFields.map(field => (
            <TextField
              key={field}
              label={getFeedbackTitle(field)}
              multiline
              rows={4}
              fullWidth
              disabled={disabled}
              value={values.feedback?.[field] ?? ''}
              onChange={e => setFieldValue(`feedback.${field}`, e.target.value)}
              size="small"
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

interface MobileRubricFormProps {
  category: JudgingCategory;
  initialValues?: RubricFormValues;
  onSaveDraft?: (values: RubricFormValues) => void;
  onSubmit?: (values: RubricFormValues) => void;
  onReset?: () => void;
  isEditable?: boolean;
}

export const MobileRubricForm: React.FC<MobileRubricFormProps> = ({
  category,
  initialValues,
  onSaveDraft,
  onSubmit,
  onReset,
  isEditable = true
}) => {
  const schema = rubrics[category];

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Formik
        initialValues={initialValues || getEmptyRubric(category)}
        onSubmit={() => {}}
        enableReinitialize
      >
        {({ values }) => (
          <Form>
            {schema.sections.map(section => (
              <MobileSection
                key={section.id}
                category={category}
                sectionId={section.id}
                fields={section.fields}
                disabled={!isEditable}
              />
            ))}

            {schema.feedback && <MobileFeedback category={category} disabled={!isEditable} />}

            <Paper sx={{ p: 2, mb: 4 }}>
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  fullWidth
                  disabled={!isEditable}
                  onClick={() => onSaveDraft?.(values)}
                >
                  Save Draft
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  disabled={!isEditable}
                  onClick={() => onSubmit?.(values)}
                >
                  Submit Review
                </Button>
                <Button variant="outlined" fullWidth disabled={!isEditable} onClick={onReset}>
                  Reset
                </Button>
              </Stack>
            </Paper>
          </Form>
        )}
      </Formik>
    </Container>
  );
};
