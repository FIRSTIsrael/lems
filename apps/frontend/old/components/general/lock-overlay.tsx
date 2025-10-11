import { Box } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

interface LockOverlayProps {
  overlayColor?: string;
  lockColor?: string;
}

const LockOverlay: React.FC<LockOverlayProps> = ({
  overlayColor = '#00000029',
  lockColor = '#555'
}) => {
  return (
    <Box
      width="100vw"
      height="100vh"
      position="fixed"
      top={0}
      left={0}
      zIndex={10}
      bgcolor={overlayColor}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <LockOutlinedIcon sx={{ width: '14rem', height: '14rem', color: lockColor }} />
    </Box>
  );
};

export default LockOverlay;
