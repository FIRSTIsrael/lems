'use client';

import { Container } from '@mui/material';
import { Formik, Form } from 'formik';
import { JudgingCategory } from '@lems/types';
import { rubrics } from '@lems/shared/rubrics';
import { RubricFormValues } from '../../rubric-types';
import { getEmptyRubric } from '../../rubric-utils';
import { RubricTable } from './rubric-table';
import { RubricActions } from './rubric-actions';

interface DesktopRubricFormProps {
  category: JudgingCategory;
  initialValues?: RubricFormValues;
  onReset?: () => void;
}

export const DesktopRubricForm: React.FC<DesktopRubricFormProps> = ({
  category,
  initialValues,
  onReset
}) => {
  const schema = rubrics[category];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Formik
        initialValues={initialValues || getEmptyRubric(category)}
        onSubmit={() => {}}
        enableReinitialize
      >
        {() => (
          <Form>
            <RubricTable sections={schema.sections} category={category} />

            <RubricActions onReset={onReset} />
          </Form>
        )}
      </Formik>
    </Container>
  );
};
