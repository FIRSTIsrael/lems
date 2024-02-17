import { useState } from 'react';
import { WithId } from 'mongodb';
import Image from 'next/image';
import { Stack, Paper, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { Event } from '@lems/types';

interface QueuerPitMapProps {
  event: WithId<Event>;
  pitMapUrl: string;
}

const QueuerPitMap: React.FC<QueuerPitMapProps> = ({ event, pitMapUrl }) => {
  const [error, setError] = useState<boolean>(false);

  return !error ? (
    <Image
      src={`${pitMapUrl}/${event._id}.png`}
      alt={`מפת פיטים ל${event.name}`}
      width={0}
      height={0}
      sizes="100vw"
      style={{
        marginTop: '40px',
        width: '100%',
        height: 'auto',
        borderRadius: '1rem',
        border: '1px solid',
        borderColor: grey[200]
      }}
      onError={() => setError(true)}
    />
  ) : (
    <Stack spacing={2} component={Paper} textAlign="center" alignItems="center" p={4} mt={8}>
      <Image width={64} height={64} src="https://emojicdn.elk.sh/😢" alt="אימוג'י בוכה" />
      <Typography fontSize="2.25rem" fontWeight={600}>
        אופס, לא נמצאה מפת פיטים לאירוע
      </Typography>
      <Typography fontSize="1.5rem" color="text.secondary">
        נא לפנות למנהל המערכת.
      </Typography>
    </Stack>
  );
};

export default QueuerPitMap;
