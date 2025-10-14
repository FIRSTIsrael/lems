import { Paper, Typography, Box } from '@mui/material';
import { JudgingTimer } from './components/judging-timer';

export default function RubricsPage() {
  return (
    <>
      {/* Placeholder for rubrics content */}
      <Paper
        elevation={1}
        sx={{
          p: 4,
          m: 2,
          textAlign: 'center',
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'white'
        }}
      >
        <Box>
          <Typography variant="h4" color="text.secondary" gutterBottom>
            Rubrics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Rubrics coming soon!
          </Typography>
        </Box>
      </Paper>

      <JudgingTimer />
    </>
  );
}
