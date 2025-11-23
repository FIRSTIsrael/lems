'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  TextField,
  Typography,
  Stack,
  lighten
} from '@mui/material';
import { useFormikContext } from 'formik';
import { JudgingCategory } from '@lems/types';
import { useRubricsGeneralTranslations } from '@lems/localization';
import { RubricFormValues } from '../../rubric-types';
import { getCategoryColor } from '../../rubric-utils';

interface MobileFeedbackProps {
  category: JudgingCategory;
  disabled?: boolean;
}

export const MobileFeedback: React.FC<MobileFeedbackProps> = ({ category, disabled = false }) => {
  const { getFeedbackTitle } = useRubricsGeneralTranslations();
  const { values, setFieldValue } = useFormikContext<RubricFormValues>();
  const feedbackFields = ['great-job', 'think-about'] as const;
  const categoryColor = getCategoryColor(category);
  const categoryBackground = lighten(categoryColor, 0.9);

  return (
    <Card
      sx={{
        mb: 3,
        borderTop: `3px solid ${categoryColor}`,
        boxShadow: 1,
        backgroundColor: `${categoryBackground}10`,
        transition: 'all 0.2s ease'
      }}
    >
      <CardHeader
        title={
          <Typography variant="h6" fontWeight={700} sx={{ color: categoryColor }}>
            Feedback
          </Typography>
        }
        sx={{
          backgroundColor: `${categoryBackground}25`,
          borderBottom: `1px solid ${categoryBackground}40`
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
