import { useRouter } from 'next/router';
import { Button, Paper } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { PortalEvent } from '@lems/types';

interface EventQuickLinksProps {
  event: PortalEvent;
  hasAwards: boolean;
}

const EventQuickLinks: React.FC<EventQuickLinksProps> = ({ event, hasAwards }) => {
  const router = useRouter();

  return (
    <Grid
      container
      component={Paper}
      columnSpacing={2}
      rowSpacing={2}
      sx={{ p: 2, my: 3, width: '100%' }}
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
      {hasAwards && (
        <Grid size={{ xs: 6, md: 3 }}>
          <Button
            variant="contained"
            fullWidth
            sx={{ borderRadius: 2, minHeight: 25 }}
            onClick={() => router.push(`/events/${event.id}/awards`)}
          >
            פרסים
          </Button>
        </Grid>
      )}
      <Grid size={{ xs: 6, md: 3 }}>
        <Button
          variant="contained"
          fullWidth
          sx={{ borderRadius: 2, minHeight: 25 }}
          onClick={() => router.push(`/events/${event.id}/schedule/field`)}
        >
          לוח זמנים - זירה
        </Button>
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <Button
          variant="contained"
          fullWidth
          sx={{ borderRadius: 2, minHeight: 25 }}
          onClick={() => router.push(`/events/${event.id}/schedule/judging`)}
        >
          לוח זמנים - שיפוט
        </Button>
      </Grid>
    </Grid>
  );
};

export default EventQuickLinks;
