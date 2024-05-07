import { WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import { Socket } from 'socket.io-client';
import {
  Paper,
  PaperProps,
  Typography,
  Box,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/';
import TaskIcon from '@mui/icons-material/Task';
import { Event, Team, Ticket, WSClientEmittedEvents, WSServerEmittedEvents } from '@lems/types';
import { localizeTeam } from '../../localization/teams';
import { localizedTicketTypes } from '../../localization/tickets';
import { useState } from 'react';

interface TicketCardProps extends PaperProps {
  division: WithId<Event>;
  ticket: WithId<Ticket>;
  team: WithId<Team> | null;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const TicketCard: React.FC<TicketCardProps> = ({ division, ticket, team, socket, ...props }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [reasonForClose, setReasonForClose] = useState<string | undefined>(ticket.reasonForClose);

  return (
    <>
      <Grid
        component={Paper}
        xs={5}
        key={ticket._id.toString()}
        p={2}
        overflow="auto"
        position="relative"
        {...props}
      >
        <Typography fontSize="1rem" fontWeight={700} gutterBottom>
          {team ? localizeTeam(team) : 'קריאה כללית'}
        </Typography>
        <Typography fontSize="1rem">{localizedTicketTypes[ticket.type]}</Typography>
        <Typography
          color="text.secondary"
          maxHeight={225}
          width="100%"
          overflow={'auto'}
          sx={{ mb: 1, wordWrap: 'break-word' }}
        >
          {ticket.content}
        </Typography>
        {ticket.closed ? (
          ticket.reasonForClose && (
            <Typography color="text.secondary" fontSize="0.8rem">
              <b>סיבת הסגירה:</b> {ticket.reasonForClose}
            </Typography>
          )
        ) : (
          <Box display="flex" justifyContent="flex-end">
            <IconButton onClick={() => setOpen(true)}>
              <TaskIcon />
            </IconButton>
          </Box>
        )}
      </Grid>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="abort-dialog-title"
        aria-describedby="abort-dialog-description"
      >
        <DialogTitle id="abort-dialog-title">סגירת קריאה</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            שימו לב! סגירת קריאה היא סופית ולא ניתן לבטל פעולה זו. האם אתם בטוחים?
          </DialogContentText>
          <TextField
            sx={{ mt: 2 }}
            label="סיבת הסגירה"
            fullWidth
            onChange={e => setReasonForClose(e.target.value)}
            value={reasonForClose}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} autoFocus>
            ביטול
          </Button>
          <Button
            onClick={() => {
              socket.emit(
                'updateTicket',
                division._id.toString(),
                team ? team._id.toString() : null,
                ticket._id.toString(),
                { closed: new Date(), reasonForClose },
                response => {
                  if (response.ok) {
                    enqueueSnackbar('הקריאה נסגרה בהצלחה!', { variant: 'success' });
                  } else {
                    enqueueSnackbar('אופס, סגירת הקריאות נכשלה', {
                      variant: 'error'
                    });
                  }
                }
              );
              setOpen(false);
            }}
          >
            אישור
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TicketCard;
