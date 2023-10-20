import { WithId } from 'mongodb';
import { Socket } from 'socket.io-client';
import Grid from '@mui/material/Unstable_Grid2/';
import { Event, Team, Ticket, WSClientEmittedEvents, WSServerEmittedEvents } from '@lems/types';
import TicketCard from './ticket-card';
import { green } from '@mui/material/colors';
import { Paper, Typography } from '@mui/material';

interface TicketPanelProps {
  event: WithId<Event>;
  tickets: Array<WithId<Ticket>>;
  teams: Array<WithId<Team>>;
  showClosed: boolean;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const TicketPanel: React.FC<TicketPanelProps> = ({ event, tickets, teams, showClosed, socket }) => {
  return (
    <Grid container columnGap={4} rowGap={2} justifyContent="center">
      {tickets.filter(t => !t.closed).length === 0 && (
        <Grid component={Paper} p={2} textAlign="center">
          <Typography variant="h1">אין קריאות פתוחות כרגע</Typography>
        </Grid>
      )}
      {tickets
        .filter(ticket => !ticket.closed)
        .map(ticket => {
          const team = teams.find(t => t._id === ticket.teamId) || ({} as WithId<Team>);
          return (
            <TicketCard
              key={ticket._id.toString()}
              event={event}
              ticket={ticket}
              team={team}
              socket={socket}
            />
          );
        })}
      {showClosed &&
        tickets
          .filter(ticket => ticket.closed)
          .map(ticket => {
            const team = teams.find(t => t._id === ticket.teamId) || ({} as WithId<Team>);
            return (
              <TicketCard
                key={ticket._id.toString()}
                event={event}
                ticket={ticket}
                team={team}
                socket={socket}
                sx={{ backgroundColor: green[100] }}
              />
            );
          })}
    </Grid>
  );
};

export default TicketPanel;
