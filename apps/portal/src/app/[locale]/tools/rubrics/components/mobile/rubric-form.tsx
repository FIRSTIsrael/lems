'use client';

import React from 'react';
import { Container, Stack } from '@mui/material';
import { rubrics } from '@lems/shared/rubrics';
import { useRubricContext } from '../rubric-context';
import { MobileSection } from './mobile-section';
import { MobileFeedback } from './mobile-feedback';

export const MobileRubricForm: React.FC = () => {
  const { category, loading } = useRubricContext();
  const schema = rubrics[category];

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Stack spacing={2}>
        {schema.sections.map(section => (
          <MobileSection
            key={section.id}
            category={category}
            sectionId={section.id}
            fields={section.fields}
            disabled={loading}
          />
        ))}

        {schema.feedback && <MobileFeedback category={category} disabled={loading} />}
      </Stack>
    </Container>
  );
};
