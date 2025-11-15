import { Paper, Typography, Box, Container } from '@mui/material';
import { JudgingTimer } from './components/judging-timer';

export default function RubricsPage() {
  return (
    <Container maxWidth="md">
      <Paper
        elevation={1}
        sx={{
          p: 4,
          m: 2,
          textAlign: 'center',
          width: '100%',
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
            Coming soon...
          </Typography>
        </Box>
      </Paper>

      <JudgingTimer />
    </Container>
  );
}
