import { Box, keyframes } from '@mui/material';
import Image from 'next/image';

const logoAnimation = keyframes`
0% {background-position: 0% 50%;}
50% {background-position: 100% 50%;}
100% {background-position: 0% 50%;}
`;

const FIRSTLogo: React.FC = () => {
  return (
    <Box
      sx={{
        background: 'linear-gradient(-45deg, #ffccbc, #f8bbd0, #bbdefb, #b2dfdb)',
        backgroundSize: '400% 400%',
        animation: `${logoAnimation} 15s ease infinite`,
        width: '100%',
        height: '100%',
        position: 'fixed',
        left: 0,
        top: 0
      }}
    >
      <Image alt="לוגו של FIRST ישראל" src="/assets/audience-display/first-israel.svg" fill />
    </Box>
  );
};
export default FIRSTLogo;
