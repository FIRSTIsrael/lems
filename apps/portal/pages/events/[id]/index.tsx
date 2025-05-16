import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';
import { Box, Container, Stack, Typography, Button, Menu, MenuItem } from '@mui/material';
import Link from 'next/link';
import { PortalEvent, PortalTeam, PortalEventStatus, PortalDivision } from '@lems/types';
import { fetchAwards, fetchEvent } from '../../../lib/api';
import EventInfo from '../../../components/events/event-info';
import EventQuickLinks from '../../../components/events/event-quick-links';
import TeamList from '../../../components/teams/team-list';
import EventStatus from '../../../components/events/event-status';
import { useRealtimeData } from '../../../hooks/use-realtime-data';
import React from 'react';

interface Props {
  event: PortalEvent;
  teams: PortalTeam[];
  hasAwards: boolean;
  divisions: PortalDivision[];
}

const Page: NextPage<Props> = ({ event, teams, hasAwards, divisions }) => {
  const {
    data: status,
    isLoading,
    error
  } = useRealtimeData<PortalEventStatus>(`/events/${event.id}/status`);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Container maxWidth="md" sx={{ my: 2 }}>
      <Typography variant="h1">{event.name}</Typography>
      {event.isDivision && (
        <>
          <Button
            variant="text"
            onClick={handleClick}
            aria-controls={open ? 'division-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            sx={{
              p: 1,
              minWidth: 'auto',
              '&:hover': {
                background: 'none'
              }
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box bgcolor={event.color} width={18} height={18} borderRadius={1} />
              <Typography variant="body1" color="text.secondary">
                {event.subtitle}
              </Typography>
            </Stack>
          </Button>
          <Menu
            id="division-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'division-button'
            }}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left'
            }}
          >
            {divisions?.map(division => (
              <Link
                key={division.id}
                href={`/events/${division.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <MenuItem onClick={handleClose}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box bgcolor={division.color} width={18} height={18} borderRadius={1} />
                    <Typography variant="body1">{division.name}</Typography>
                  </Stack>
                </MenuItem>
              </Link>
            ))}
          </Menu>
        </>
      )}
      <EventInfo event={event} teamCount={teams.length} />
      {!isLoading && !error && status.isLive && <EventStatus event={event} status={status} />}
      <EventQuickLinks event={event} hasAwards={hasAwards} />
      <Typography variant="h2" gutterBottom>
        קבוצות באירוע
      </Typography>
      <TeamList eventId={event.id} teams={teams} />
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const eventId = ctx.params?.id as string;
  const { event, teams } = await fetchEvent(eventId);
  const awards = await fetchAwards(eventId);
  const divisions = event.divisions || [];
  return { props: { event, teams, hasAwards: !!awards, divisions } };
};

export default Page;
