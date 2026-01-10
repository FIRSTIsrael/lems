'use client';

import { Box, Stack, Grid } from '@mui/material';

interface RubricScore {
  [key: string]: number;
}

interface ExportRubricProps {
  divisionName: string;
  teamNumber: number;
  teamName: string;
  rubricCategory: string;
  scores: RubricScore;
  showFeedback?: boolean;
}

const ExportRubric: React.FC<ExportRubricProps> = ({
  divisionName,
  teamNumber,
  teamName,
  rubricCategory,
  scores,
  showFeedback = true
}) => {
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
      <Stack spacing={2} sx={{ height: '100%', p: 2 }}>
        <Box>
          <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{divisionName}</Box>
          <Box sx={{ fontSize: '1.2rem' }}>
            Team #{teamNumber} - {teamName}
          </Box>
          <Box sx={{ fontSize: '1rem', color: 'text.secondary' }}>Category: {rubricCategory}</Box>
        </Box>

        <Grid container spacing={2}>
          {Object.entries(scores).map(([key, value]) => (
            <Grid item xs={12} sm={6} key={key}>
              <Box sx={{ p: 1, border: '1px solid #ccc', borderRadius: 1 }}>
                <Box sx={{ fontWeight: 'bold' }}>{key}</Box>
                <Box sx={{ fontSize: '1.2rem' }}>{value}</Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        {showFeedback && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Box sx={{ fontWeight: 'bold', mb: 1 }}>Feedback</Box>
            <Box sx={{ minHeight: '100px' }} />
          </Box>
        )}
      </Stack>
      <Box sx={{ '@media print': { pageBreakAfter: 'always' } }} />
    </Box>
  );
};

export default ExportRubric;
