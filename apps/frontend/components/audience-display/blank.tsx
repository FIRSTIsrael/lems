import { Box } from '@mui/material';

const Blank: React.FC = () => {
  return (
    <Box
      sx={{
        background: 'url(/assets/audience-display/season-background.jpg) center / cover',
        width: '100%',
        height: '100%',
        position: 'fixed',
        left: 0,
        top: 0
      }}
    />
  );
};
export default Blank;
