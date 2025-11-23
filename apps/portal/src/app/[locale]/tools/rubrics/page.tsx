'use client';

import { useTranslations } from 'next-intl';
import { Container, Typography } from '@mui/material';
import { RubricForm } from './components/rubric-form';

export default function RubricsPage() {
  const t = useTranslations('pages.tools.rubrics');

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }} gutterBottom>
        {t('title')}
      </Typography>

      <RubricForm />
    </Container>
  );
}
