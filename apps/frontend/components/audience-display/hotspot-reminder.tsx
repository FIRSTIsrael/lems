import { Paper, Stack, Typography, Box } from '@mui/material';

const HotspotReminder: React.FC = () => {
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
        backgroundRepeat: 'no-repeat'
      }}
    >
      <Paper
        sx={{
          p: 8,
          textAlign: 'center',
          mx: '50px',
          borderRadius: 8,
          border: '1rem solid #facc15'
        }}
      >
        <Typography variant="h1" fontSize="6rem" gutterBottom>
          בבקשה כבו את ה-WiFi בטלפונים
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Typography variant="h1" fontSize="4.5rem" bgcolor="#facc15">
            ואל תפעילו
          </Typography>
          <Typography variant="h1" fontSize="4.5rem">
            נקודות גישה חמות
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

export default HotspotReminder;
