'use client';

import { useState } from 'react';
import {
  Container,
  Stack,
  Box,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MuiButton,
  Typography
} from '@mui/material';
import { JudgingCategory } from '@lems/types';
import { ResponsiveComponent } from '@lems/shared';
import { DesktopRubricForm } from './components/desktop/rubric-form';
import { MobileRubricForm } from './components/mobile/rubric-form';
import { useRubric } from './hooks/use-rubric';
import { RubricProvider } from './components/rubric-context';
import { RubricFormValues } from './types/rubric-types';
import { getEmptyRubric } from './utils/rubric-utils';

const categories: JudgingCategory[] = ['innovation-project', 'robot-design', 'core-values'];

const categoryLabels: Record<JudgingCategory, string> = {
  'innovation-project': 'Innovation Project',
  'robot-design': 'Robot Design',
  'core-values': 'Core Values'
};

function RubricPageContent() {
  const [currentCategory, setCurrentCategory] = useState<JudgingCategory>('innovation-project');
  const [showClearDialog, setShowClearDialog] = useState(false);

  const { rubric, updateRubric, resetRubric, loading } = useRubric(currentCategory);

  const handleCategoryChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentCategory(categories[newValue]);
  };

  const handleSaveDraft = async (values: RubricFormValues) => {
    await updateRubric(values);
  };

  const handleSubmit = async (values: RubricFormValues) => {
    await updateRubric(values);
    // TODO: Submit to backend
  };

  const handleReset = () => {
    setShowClearDialog(true);
  };

  const confirmReset = async () => {
    await resetRubric();
    setShowClearDialog(false);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  const currentCategoryIndex = categories.indexOf(currentCategory);

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
              Rubrics Evaluation
            </Typography>
            <Tabs
              value={currentCategoryIndex}
              onChange={handleCategoryChange}
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  color: 'text.secondary',
                  transition: 'color 0.2s ease',
                  '&:hover': {
                    color: 'text.primary'
                  }
                },
                '& .MuiTab-root.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 600
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'primary.main',
                  height: 2
                }
              }}
            >
              {categories.map((category, index) => (
                <Tab
                  key={category}
                  label={categoryLabels[category]}
                  id={`rubric-tab-${index}`}
                  aria-controls={`rubric-tabpanel-${index}`}
                />
              ))}
            </Tabs>
          </Box>

          <Box
            role="tabpanel"
            hidden={currentCategoryIndex !== categories.indexOf(currentCategory)}
            id={`rubric-tabpanel-${currentCategoryIndex}`}
            aria-labelledby={`rubric-tab-${currentCategoryIndex}`}
          >
            {!loading && (
              <ResponsiveComponent
                desktop={
                  <DesktopRubricForm
                    category={currentCategory}
                    initialValues={rubric?.values || getEmptyRubric(currentCategory)}
                    onSaveDraft={handleSaveDraft}
                    onSubmit={handleSubmit}
                    onReset={handleReset}
                    isEditable={true}
                  />
                }
                mobile={
                  <MobileRubricForm
                    category={currentCategory}
                    initialValues={rubric?.values || getEmptyRubric(currentCategory)}
                    onSaveDraft={handleSaveDraft}
                    onSubmit={handleSubmit}
                    onReset={handleReset}
                    isEditable={true}
                  />
                }
              />
            )}
          </Box>
        </Stack>
      </Container>

      <Dialog open={showClearDialog} onClose={() => setShowClearDialog(false)}>
        <DialogTitle>Clear Rubric Data?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to clear all {categoryLabels[currentCategory]} rubric data? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setShowClearDialog(false)}>Cancel</MuiButton>
          <MuiButton onClick={confirmReset} variant="contained" color="error">
            Clear
          </MuiButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function RubricsPage() {
  return (
    <RubricProvider>
      <RubricPageContent />
    </RubricProvider>
  );
}
