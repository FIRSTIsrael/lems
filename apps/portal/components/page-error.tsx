import { Container, Paper, Typography } from '@mui/material';

interface PageErrorProps {
  statusCode: number;
}

const PageError: React.FC<PageErrorProps> = ({ statusCode }) => {
  return (
    <Container
      maxWidth="md"
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translateX(-50%) translateY(-50%)'
      }}
    >
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h1" gutterBottom>
          {
            statusCode === 404 ? 'מצטערים, העמוד המבוקש לא נמצא' : 'שגיאה לא צפויה, אנא נסו שנית'
          }
        </Typography>
        <Typography variant="h2" sx={{ color: '#666' }} fontSize="1rem">
          #{statusCode}error
        </Typography>
      </Paper>
    </Container>
  );
};

export default PageError;
