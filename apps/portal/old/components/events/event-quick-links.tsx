import Link from 'next/link';
import { Button, Paper } from '@mui/material';
import Grid from '@mui/material/Grid';
import { PortalEvent } from '@lems/types';
import { useTranslations } from 'next-intl';

interface EventQuickLinksProps {
  event: PortalEvent;
  hasAwards: boolean;
}

const EventQuickLinks: React.FC<EventQuickLinksProps> = ({ event, hasAwards }) => {
  const t = useTranslations('components.events.event-quick-links');

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
          {t('scoreboard')}
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
            {t('awards')}
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
          {t('field-schedule')}
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
          {t('judging-schedule')}
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
          {t('general-schedule')}
        </Button>
      </Grid>
    </Grid>
  );
};

export default EventQuickLinks;
