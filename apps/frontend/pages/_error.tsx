import { Container, Paper, Typography } from '@mui/material';
import { NextPage } from 'next';
import Image from 'next/image';

interface Props {
  statusCode?: number;
}

const Error: NextPage<Props> = ({ statusCode }) => {
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
        <Image
          width={96}
          height={96}
          src="/assets/emojis/downcast-face-with-sweat.png"
          alt="אימוג׳י עצוב"
        />
        <Typography variant="h1" gutterBottom>
          שגיאה לא צפויה, אנא נסו שנית
        </Typography>
        <Typography variant="h2" sx={{ color: '#666' }} fontSize="1.5rem">
          קוד שגיאה: {statusCode}
        </Typography>
      </Paper>
    </Container>
  );
};

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
