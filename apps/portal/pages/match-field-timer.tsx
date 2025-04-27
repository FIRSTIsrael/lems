import { Container } from '@mui/material';
import { FieldTimer } from '../components/match/field-timer';

const MatchFieldTimerPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <FieldTimer />
    </Container>
  );
};

export default MatchFieldTimerPage;
