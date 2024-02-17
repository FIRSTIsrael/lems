import { Paper, Box, keyframes } from '@mui/material';
import Image from 'next/image';
import Images from '../../../public/assets/audience-display/sponsors/index';

const ScoreboardSponsorsRow: React.FC = () => {
  const forwards = keyframes`
  from {transform: translateX(0)}
  to {transform: translateX(-100%)}
  `;
  const backwards = keyframes`
  from {transform: translateX(100%)}
  to {transform: translateX(0)}
  `;

  return (
    <Paper
      sx={{
        width: '100%',
        overflow: 'hidden',
        justifyContent: 'center',
        py: 4
      }}
    >
      <Box height={100} display="flex" position="relative">
        <Box sx={{ animation: `${forwards} 30s linear infinite` }} display="flex" height={100}>
          {Object.values(Images).map((image, index) => (
            <Image
              key={index}
              style={{
                objectFit: 'contain',
                marginRight: '10rem',
                marginTop: '-0.5rem',
                width: 'auto',
                height: '75%',
                display: 'inline-block'
              }}
              src={image}
              alt="לוגו"
              priority
            />
          ))}
        </Box>
        <Box sx={{ animation: `${backwards} 30s linear infinite` }} display="flex" height={100}>
          {Object.values(Images).map((image, index) => (
            <Image
              key={index}
              style={{
                objectFit: 'contain',
                marginRight: '10rem',
                marginTop: '-0.5rem',
                width: 'auto',
                height: '75%',
                display: 'inline-block'
              }}
              src={image}
              alt="לוגו"
              priority
            />
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default ScoreboardSponsorsRow;
