'use client';

import { Container } from '@mui/material';
import { Formik, Form } from 'formik';
import { JudgingCategory } from '@lems/types';
import { rubrics } from '@lems/shared/rubrics';
import { RubricFormValues } from '../../types/rubric-types';
import { getEmptyRubric } from '../../utils/rubric-utils';
import { RubricTable } from './rubric-table';
import { RubricActions } from './rubric-actions';

interface DesktopRubricFormProps {
  category: JudgingCategory;
  initialValues?: RubricFormValues;
  onSaveDraft?: (values: RubricFormValues) => void;
  onSubmit?: (values: RubricFormValues) => void;
  onReset?: () => void;
  isEditable?: boolean;
}

export const DesktopRubricForm: React.FC<DesktopRubricFormProps> = ({
  category,
  initialValues,
  onSaveDraft,
  onSubmit,
  onReset,
  isEditable = true
}) => {
  const schema = rubrics[category];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Formik
        initialValues={initialValues || getEmptyRubric(category)}
        onSubmit={() => {}}
        enableReinitialize
      >
        {({ values }) => (
          <Form>
            <RubricTable sections={schema.sections} category={category} disabled={!isEditable} />

            <RubricActions
              disabled={!isEditable}
              onSaveDraft={() => onSaveDraft?.(values)}
              onSubmit={() => onSubmit?.(values)}
              onReset={onReset}
            />
          </Form>
        )}
      </Formik>
    </Container>
  );
};
