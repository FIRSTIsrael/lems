import Image from 'next/image';
import { Paper, Typography } from '@mui/material';

const AwardsNotReadyCard: React.FC = () => {
  return (
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      <Image src={'https://emojicdn.elk.sh/🤫'} width={96} height={96} alt="אימוג׳י שקט" />
      <Typography variant="h2" align="center" gutterBottom>
        הפרסים טרם נקבעו!
      </Typography>
      <Typography align="center" fontSize="1.2rem">
        ליינאפ הפרסים יפתח כאשר השופט הראשי ינעל את הפרסים ויאפשר את הצגתם.
      </Typography>
    </Paper>
  );
};

export default AwardsNotReadyCard;
