'use client';

import { Container, Box } from '@mui/material';
import { ResponsiveComponent } from '@lems/shared';
import { RubricTable } from './components/desktop';
import { MobileRubricForm } from './components/mobile/rubric-form';
import { RubricProvider } from './components/rubric-context';
import { JudgingTimer } from './components/judging-timer';
import { RubricHeader } from './components/rubric-header';
import { RubricPrintStyles } from './components/rubric-print-styles';

export default function RubricsPage() {
  return (
    <>
      <RubricPrintStyles />

      <RubricProvider>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box className="rubric-header">
            <RubricHeader />
          </Box>

          <Box className="rubric-content">
            <ResponsiveComponent desktop={<RubricTable />} mobile={<MobileRubricForm />} />
          </Box>

          <Box className="judging-timer">
            <JudgingTimer />
          </Box>
        </Container>
      </RubricProvider>
    </>
  );
}
