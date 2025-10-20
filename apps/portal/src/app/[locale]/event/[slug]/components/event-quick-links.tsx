'use client';

import { useTranslations } from 'next-intl';
import { Paper, Typography, Grid, Button } from '@mui/material';
import { Leaderboard, EmojiEvents, Schedule, Gavel, CalendarMonth } from '@mui/icons-material';
import Link from 'next/link';

interface EventQuickLinksProps {
  eventSlug: string;
  divisionId?: string;
  hasAwards?: boolean;
}

export const EventQuickLinks: React.FC<EventQuickLinksProps> = ({
  eventSlug,
  divisionId,
  hasAwards = false
}) => {
  const t = useTranslations('pages.event.quick-links');

  const getUrl = (path: string) => {
    const baseUrl = `/event/${eventSlug}/${path}`;
    return divisionId ? `${baseUrl}?divisionId=${divisionId}` : baseUrl;
  };

  return (
    <Paper sx={{ p: 4, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        {t('title')}
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Button
            component={Link}
            href={getUrl('scoreboard')}
            variant="contained"
            fullWidth
            startIcon={<Leaderboard />}
            sx={{
              minHeight: 56,
              borderRadius: 2,
              textTransform: 'none'
            }}
          >
            {t('scoreboard')}
          </Button>
        </Grid>

        {hasAwards && (
          <Grid size={{ xs: 6, md: 3 }}>
            <Button
              component={Link}
              href={getUrl('awards')}
              variant="contained"
              fullWidth
              startIcon={<EmojiEvents />}
              sx={{
                minHeight: 56,
                borderRadius: 2,
                textTransform: 'none'
              }}
            >
              {t('awards')}
            </Button>
          </Grid>
        )}

        <Grid size={{ xs: 6, md: 3 }}>
          <Button
            component={Link}
            href={getUrl('schedule/field')}
            variant="contained"
            fullWidth
            startIcon={<Schedule />}
            sx={{
              minHeight: 56,
              borderRadius: 2,
              textTransform: 'none'
            }}
          >
            {t('field-schedule')}
          </Button>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <Button
            component={Link}
            href={getUrl('schedule/judging')}
            variant="contained"
            fullWidth
            startIcon={<Gavel />}
            sx={{
              minHeight: 56,
              borderRadius: 2,
              textTransform: 'none'
            }}
          >
            {t('judging-schedule')}
          </Button>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <Button
            component={Link}
            href={getUrl('schedule/general')}
            variant="contained"
            fullWidth
            startIcon={<CalendarMonth />}
            sx={{
              minHeight: 56,
              borderRadius: 2,
              textTransform: 'none'
            }}
          >
            {t('general-schedule')}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};
