import Link from 'next/link';
import { Button, Paper } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { PortalEvent } from '@lems/types';

interface EventQuickLinksProps {
  event: PortalEvent;
  hasAwards: boolean;
}

const EventQuickLinks: React.FC<EventQuickLinksProps> = ({ event, hasAwards }) => {
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
          href={`/events/${event.id}/scoreboard`}
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
            href={`/events/${event.id}/awards`}
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
          href={`/events/${event.id}/schedule/field`}
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
          href={`/events/${event.id}/schedule/judging`}
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
          href={`/events/${event.id}/schedule/general`}
        >
          לוח זמנים כללי
        </Button>
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <Button
          variant="contained"
          fullWidth
          sx={{ borderRadius: 2, minHeight: 25 }}
          LinkComponent={Link}
          href={`/events/${event.id}/scorer`}
        >
          מחשבון ניקוד
        </Button>
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <Button
          variant="contained"
          fullWidth
          sx={{ borderRadius: 2, minHeight: 25 }}
          LinkComponent={Link}
          href={`/events/${event.id}/judging-timer`}
        >
          טיימר חדר שיפוט
        </Button>
      </Grid>
    </Grid>
  );
};

export default EventQuickLinks;
