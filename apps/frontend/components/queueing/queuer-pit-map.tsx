import { useState } from 'react';
import { WithId } from 'mongodb';
import Image from 'next/image';
import { Stack, Paper, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { Division } from '@lems/types';

interface QueuerPitMapProps {
  division: WithId<Division>;
  pitMapUrl: string;
}

const QueuerPitMap: React.FC<QueuerPitMapProps> = ({ division, pitMapUrl }) => {
  const [error, setError] = useState<boolean>(false);

  return !error ? (
    <Image
      src={`${pitMapUrl}/${division._id}.png`}
      alt={`מפת פיטים ל${division.name}`}
      width={0}
      height={0}
      sizes="100vw"
      style={{
        marginTop: '10px',
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
      <Typography fontSize="1.5rem" color="textSecondary">
        נא לפנות למנהל המערכת.
      </Typography>
    </Stack>
  );
};

export default QueuerPitMap;
