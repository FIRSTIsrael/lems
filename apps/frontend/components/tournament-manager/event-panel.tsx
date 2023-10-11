import { Button, Paper, Stack } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PublishIcon from '@mui/icons-material/Publish';

const EventPanel: React.FC = () => {
  return (
    <Stack component={Paper} p={2} justifyContent="center" direction="row" spacing={4}>
      <Button variant="contained" sx={{ minWidth: 250 }} startIcon={<DownloadIcon />} disabled>
        הורדת תוצאות האירוע
      </Button>
      <Button variant="contained" sx={{ minWidth: 250 }} startIcon={<PublishIcon />} disabled>
        פרסום המחוונים ב-Dashboard
      </Button>
    </Stack>
  );
};

export default EventPanel;
