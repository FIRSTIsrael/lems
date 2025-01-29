import { useRouter } from 'next/router';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { PortalAward, PortalEvent, PortalTeam } from '@lems/types';

interface EventQuickLinksProps {
  event: PortalEvent;
  teams: PortalTeam[];
  awards: PortalAward[] | null;
}

const EventQuickLinks: React.FC<EventQuickLinksProps> = ({ event, teams, awards }) => {
  const router = useRouter();

  return (
    <Grid
      container
      component={Paper}
      columnSpacing={2}
      rowSpacing={2}
      sx={{ p: 2, my: 2, width: '100%' }}
    >
      <Grid size={{ xs: 6, md: 3 }}>
        <Button
          variant="contained"
          fullWidth
          sx={{ borderRadius: 2, minHeight: 25 }}
          onClick={() => router.push(`/events/${event.id}/scoreboard`)}
        >
          לוח תוצאות
        </Button>
      </Grid>
      {awards?.length && (
        <Grid size={{ xs: 6, md: 3 }}>
          <Button
            variant="contained"
            fullWidth
            sx={{ borderRadius: 2, minHeight: 25 }}
            onClick={() => router.push(`/events/${event.id}/scoreboard`)}
          >
            פרסים
          </Button>
        </Grid>
      )}
    </Grid>
  );
};

export default EventQuickLinks;
