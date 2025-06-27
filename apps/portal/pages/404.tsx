import { Container, Paper, Typography } from '@mui/material';
import { GetStaticPropsContext, NextPage } from 'next';
import { getMessages } from '../lib/localization';

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

export const getStaticProps = async ({ locale }: GetStaticPropsContext) => {
  const messages = await getMessages(locale);
  return { props: { messages } };
};

export default Custom404;
