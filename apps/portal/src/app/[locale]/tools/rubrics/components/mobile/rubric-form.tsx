'use client';

import React from 'react';
import { Container, Paper, Stack, Button } from '@mui/material';
import { Formik, Form } from 'formik';
import { JudgingCategory } from '@lems/types';
import { rubrics } from '@lems/shared/rubrics';
import { RubricFormValues } from '../../rubric-types';
import { getEmptyRubric } from '../../rubric-utils';
import { MobileSection } from './mobile-section';
import { MobileFeedback } from './mobile-feedback';

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
        {() => (
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
