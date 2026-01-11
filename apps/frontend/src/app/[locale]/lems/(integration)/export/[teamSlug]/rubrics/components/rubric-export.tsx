'use client';

import { Box, Stack, Grid, Typography } from '@mui/material';
import { rubrics, RubricCategorySchema } from '@lems/shared/rubrics';
import { JudgingCategory } from '@lems/types/judging';
import { RubricExportHeader } from './rubric-export-header';
import { RubricExportAwards } from './rubric-export-awards';
import { RubricExportTable } from './rubric-export-table';

interface RubricExportProps {
  rubric: {
    id: string;
    category: JudgingCategory;
    status: string;
    data: {
      awards: Record<string, boolean>;
      fields: Record<string, number>;
      feedback?: {
        greatJob: string;
        thinkAbout: string;
      };
    };
  };
  team: {
    id: string;
    number: number;
  };
  awards: Array<{
    id: string;
    name: string;
  }>;
  divisionName: string;
  showFeedback?: boolean;
}

export const RubricExport: React.FC<RubricExportProps> = ({
  rubric,
  team,
  awards,
  divisionName,
  showFeedback = true
}) => {
  const schema: RubricCategorySchema | undefined = rubrics[rubric.category];

  if (!schema) {
    return <Typography color="error">Invalid rubric category</Typography>;
  }

  return (
    <Box
      component="section"
      sx={{
        pageBreakInside: 'avoid !important',
        breakInside: 'avoid !important',
        position: 'relative',
        boxSizing: 'border-box',
        '@media print': {
          margin: '0',
          padding: '0',
          maxHeight: '100vh',
          overflow: 'hidden'
        }
      }}
    >
      <Stack spacing={0} sx={{ height: '100%' }}>
        <Grid container spacing={1}>
          <RubricExportHeader
            rubric={rubric}
            schema={schema as RubricCategorySchema}
            team={team}
            divisionName={divisionName}
          />
          <RubricExportAwards
            rubric={rubric}
            schema={schema as RubricCategorySchema}
            divisionAwards={awards}
          />
        </Grid>
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <RubricExportTable rubric={rubric} showFeedback={showFeedback} />
        </Box>
      </Stack>
    </Box>
  );
};
