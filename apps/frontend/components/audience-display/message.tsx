import { Paper, Stack, Typography, Box } from '@mui/material';

interface MessageProps {
  message: string;
  borderColor?: string;
}

const Message: React.FC<MessageProps> = ({ message, borderColor }) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100%"
      width="100%"
      position="absolute"
      top={0}
      left={0}
      sx={{
        backgroundImage: 'url(/assets/audience-display/season-background.webp)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
      }}
    >
      <Paper
        sx={{
          p: 8,
          textAlign: 'center',
          mx: '50px',
          borderRadius: 8,
          border: `1rem solid ${borderColor || '#000'}`,
          minWidth: '30%'
        }}
      >
        <Typography variant="h1" fontSize="3rem" fontWeight={400} gutterBottom>
          {message}
        </Typography>
      </Paper>
    </Box>
  );
};

export default Message;
