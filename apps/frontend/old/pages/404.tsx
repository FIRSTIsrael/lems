import { Container, Paper, Typography } from '@mui/material';
import { NextPage } from 'next';
import Image from 'next/image';

const Custom404: NextPage = () => {
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
        <Image width={96} height={96} src="/assets/emojis/dizzy-face.png" alt="אימוג׳י עצוב" />
        <Typography variant="h1" gutterBottom>
          הדף אליו נכנסתם לא נמצא
        </Typography>
        <Typography variant="h2" sx={{ color: '#666' }} fontSize="1.5rem">
          שגיאה 404
        </Typography>
      </Paper>
    </Container>
  );
};

export default Custom404;
