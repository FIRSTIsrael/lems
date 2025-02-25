import Link from 'next/link';
import { Button, Paper } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { PortalEvent } from '@lems/types';

interface EventQuickLinksProps {
  eventId: string;
  event: PortalEvent;
  hasAwards: boolean;
}

const EventQuickLinks: React.FC<EventQuickLinksProps> = ({ eventId, event, hasAwards }) => {
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
          LinkComponent={Link}
          href={`/events/${eventId}/scoreboard`}
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
            LinkComponent={Link}
            href={`/events/${eventId}/awards`}
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
          LinkComponent={Link}
          href={`/events/${eventId}/schedule/field`}
        >
          לוח זמנים - זירה
        </Button>
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <Button
          variant="contained"
          fullWidth
          sx={{ borderRadius: 2, minHeight: 25 }}
          LinkComponent={Link}
          href={`/events/${eventId}/schedule/judging`}
        >
          לוח זמנים - שיפוט
        </Button>
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <Button
          variant="contained"
          fullWidth
          sx={{ borderRadius: 2, minHeight: 25 }}
          LinkComponent={Link}
          href={`/events/${eventId}/schedule/general`}
        >
          לוח זמנים כללי
        </Button>
      </Grid>
    </Grid>
  );
};

export default EventQuickLinks;
