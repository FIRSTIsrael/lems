import { Stack, Box, Typography } from '@mui/material';
import { PortalEvent } from '@lems/types';

interface StyledEventSubtitleProps {
  event: PortalEvent;
}

const StyledEventSubtitle: React.FC<StyledEventSubtitleProps> = ({ event }) => {
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      {event.isDivision && <Box bgcolor={event.color} width={18} height={18} borderRadius={1} />}
      <Typography variant="body1" color="text.secondary" gutterBottom>
        {event.name} {event.isDivision && ` - ${event.subtitle}`}
      </Typography>
    </Stack>
  );
};

export default StyledEventSubtitle;
