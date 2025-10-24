import { useState } from 'react';
import { WithId } from 'mongodb';
import { Socket } from 'socket.io-client';
import Grid from '@mui/material/Grid';
import { Division, Team, Ticket, WSClientEmittedEvents, WSServerEmittedEvents } from '@lems/types';
import { green } from '@mui/material/colors';
import { Paper, Typography, Collapse, Button } from '@mui/material';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import TicketCard from './ticket-card';

interface TicketPanelProps {
  division: WithId<Division>;
  tickets: Array<WithId<Ticket>>;
  teams: Array<WithId<Team>>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const TicketPanel: React.FC<TicketPanelProps> = ({ division, tickets, teams, socket }) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <>
      {tickets.filter(t => !t.closed).length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', mb: 4 }}>
          <Typography variant="h1">אין קריאות פתוחות כרגע</Typography>
        </Paper>
      )}

      <Grid container columnGap={4} rowGap={2} justifyContent="center">
        {tickets
          .filter(ticket => !ticket.closed)
          .map(ticket => {
            const team = teams.find(t => t._id === ticket.teamId) || null;
            return (
              <TicketCard
                key={ticket._id.toString()}
                division={division}
                ticket={ticket}
                team={team}
                socket={socket}
              />
            );
          })}
      </Grid>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '20px'
        }}
      >
        <Button
          onClick={() => setExpanded(expanded => !expanded)}
          variant="contained"
          endIcon={expanded ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
        >
          הצג קריאות סגורות
        </Button>
      </div>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Grid container columnGap={4} rowGap={2} justifyContent="center" sx={{ mt: 2 }}>
          {tickets
            .filter(ticket => ticket.closed)
            .map(ticket => {
              const team = teams.find(t => t._id === ticket.teamId) || null;
              return (
                <TicketCard
                  key={ticket._id.toString()}
                  division={division}
                  ticket={ticket}
                  team={team}
                  socket={socket}
                  sx={{ backgroundColor: green[100] }}
                />
              );
            })}
        </Grid>
      </Collapse>
    </>
  );
};

export default TicketPanel;
