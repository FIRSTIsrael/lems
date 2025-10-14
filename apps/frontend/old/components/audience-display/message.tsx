import { Paper, Typography, Box } from '@mui/material';
import Image from 'next/image';
import SeasonLogo from '../../public/assets/audience-display/season-logo.svg';

interface MessageProps {
  message: string;
}

const Message: React.FC<MessageProps> = ({ message }) => {
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
      {message ? (
        <Paper
          sx={{
            p: 8,
            textAlign: 'center',
            mx: '50px',
            borderRadius: 8,
            border: `1rem solid rgb(48, 89, 191)`,
            minWidth: '30%'
          }}
        >
          <Typography variant="h1" fontSize="4.5rem">
            {message}
          </Typography>
        </Paper>
      ) : (
        <Image
          src={SeasonLogo}
          width={0}
          height={0}
          sizes="100vw"
          alt="לוגו עונתי"
          style={{
            padding: 200,
            objectFit: 'cover',
            width: '100%',
            height: 'auto'
          }}
        />
      )}
    </Box>
  );
};

export default Message;
