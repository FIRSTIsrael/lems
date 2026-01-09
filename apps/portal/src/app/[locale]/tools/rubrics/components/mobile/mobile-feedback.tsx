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
import { JudgingCategory } from '@lems/types/judging';
import { useRubricsGeneralTranslations } from '@lems/localization';
import { getRubricColor } from '@lems/shared/rubrics/rubric-utils';
import { useTranslations } from 'next-intl';
import { useRubricContext } from '../rubric-context';

interface MobileFeedbackProps {
  category: JudgingCategory;
  disabled?: boolean;
}

export const MobileFeedback: React.FC<MobileFeedbackProps> = ({ category, disabled = false }) => {
  const t = useTranslations('pages.tools.rubrics');
  const { getFeedbackTitle } = useRubricsGeneralTranslations();
  const { rubric, updateRubric } = useRubricContext();
  const feedbackFields = ['greatJob', 'thinkAbout'] as const;

  const color = getRubricColor(category);
  const background = lighten(color, 0.9);

  const handleFeedbackChange = async (field: 'greatJob' | 'thinkAbout', value: string) => {
    const feedback = {
      greatJob: rubric.values.feedback?.greatJob || '',
      thinkAbout: rubric.values.feedback?.thinkAbout || ''
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
        borderTop: `3px solid ${color}`,
        boxShadow: 1,
        backgroundColor: `${background}10`,
        transition: 'all 0.2s ease'
      }}
    >
      <CardHeader
        title={
          <Typography variant="h6" fontWeight={700} sx={{ color }}>
            {t('mobile-feedback')}
          </Typography>
        }
        sx={{
          backgroundColor: `${background}25`,
          borderBottom: `1px solid ${background}40`
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
