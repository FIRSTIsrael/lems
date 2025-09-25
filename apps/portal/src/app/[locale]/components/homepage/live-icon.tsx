import { Box, keyframes } from '@mui/material';

export const LiveIcon: React.FC = () => {
  const liveAnimation = keyframes`0% {
    transform: scale(1, 1);
  }
  100% {
    transform: scale(3.5, 3.5);
    background-color: rgba(255, 0, 0, 0);
  }`;

  return (
    <Box
      component="span"
      display="inline-block"
      position="relative"
      bgcolor="red"
      width={12}
      height={12}
      border="1px solid rgba(0, 0, 0, 0.1)"
      borderRadius="50%"
      zIndex={1}
      sx={{
        '::before': {
          content: '""',
          display: 'block',
          position: 'absolute',
          backgroundColor: 'rgba(255, 0, 0, 0.6)',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          animation: `${liveAnimation} 2s ease-in-out infinite`,
          zIndex: -1
        }
      }}
    />
  );
};
