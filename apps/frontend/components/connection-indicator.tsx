import { Box, keyframes } from '@mui/material';
import { ConnectionStatus } from '@lems/types';

const config: {
  [key in ConnectionStatus]: {
    rippleColor: string;
    textColor: string;
    backgroundColor: string;
    text: string;
  };
} = {
  connected: {
    rippleColor: '#3cd3b2',
    textColor: '#111111',
    backgroundColor: '#f4f4f5',
    text: 'מחובר'
  },
  connecting: {
    rippleColor: '#a21caf',
    textColor: '#000000',
    backgroundColor: '#f4f4f5',
    text: 'מתחבר...'
  },
  disconnected: {
    rippleColor: '#ffffff',
    textColor: '#ffffff',
    backgroundColor: '#dc2626',
    text: 'שגיאה'
  }
} as const;

const rippleAnimation = keyframes`
  0% {transform: scale(1);}
  50% {transform: scale(1.125);}
  100% {transform: scale(1);}
`;

interface ConnectionIndicatorProps {
  status: ConnectionStatus;
}

const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({ status }) => {
  const { rippleColor, textColor, backgroundColor, text } = config[status];
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        color: textColor,
        bgcolor: backgroundColor,
        py: 0.5,
        px: 1.75,
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: 500,
        minWidth: 100,
        transition: 'all 0.2s ease-in-out'
      }}
    >
      <Box
        sx={{
          height: '0.675rem',
          width: '0.675rem',
          borderRadius: '50%',
          backgroundColor: rippleColor,
          boxShadow: `0 0 0 0.25rem ${rippleColor}33`,
          mr: 1.25,
          animation: `${rippleAnimation} 2s linear infinite`,
          transition: 'all 0.2s ease-in-out'
        }}
      />
      <Box flex={1} textAlign="center">
        {text}
      </Box>
    </Box>
  );
};

export default ConnectionIndicator;
