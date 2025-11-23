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
import { JudgingCategory } from '@lems/types';
import { useRubricsGeneralTranslations } from '@lems/localization';
import { getCategoryColor } from '../../rubric-utils';
import { useRubricContext } from '../rubric-context';

interface MobileFeedbackProps {
  category: JudgingCategory;
  disabled?: boolean;
}

export const MobileFeedback: React.FC<MobileFeedbackProps> = ({ category, disabled = false }) => {
  const { getFeedbackTitle } = useRubricsGeneralTranslations();
  const { rubric, updateRubric } = useRubricContext();
  const feedbackFields = ['great-job', 'think-about'] as const;
  const categoryColor = getCategoryColor(category);
  const categoryBackground = lighten(categoryColor, 0.9);

  const handleFeedbackChange = async (field: 'great-job' | 'think-about', value: string) => {
    const feedback = {
      'great-job': rubric.values.feedback?.['great-job'] || '',
      'think-about': rubric.values.feedback?.['think-about'] || ''
    };

    const updatedValues = {
      ...rubric.values,
      feedback: {
        ...feedback,
        [field]: value
      }
    };
    await updateRubric(updatedValues);
  };

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
              value={rubric.values.feedback?.[field] ?? ''}
              onChange={e => handleFeedbackChange(field, e.target.value)}
              onBlur={e => handleFeedbackChange(field, e.target.value)}
              size="small"
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};
