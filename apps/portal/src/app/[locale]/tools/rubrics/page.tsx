'use client';

import { Container } from '@mui/material';
import { ResponsiveComponent } from '@lems/shared';
import { RubricTable } from './components/desktop';
import { MobileRubricForm } from './components/mobile/rubric-form';
import { RubricProvider } from './components/rubric-context';
import { JudgingTimer } from './components/judging-timer';
import { RubricHeader } from './components/rubric-header';

export default function RubricsPage() {
  return (
    <RubricProvider>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <RubricHeader />

        <ResponsiveComponent desktop={<RubricTable />} mobile={<MobileRubricForm />} />

        <JudgingTimer />
      </Container>
    </RubricProvider>
  );
}
