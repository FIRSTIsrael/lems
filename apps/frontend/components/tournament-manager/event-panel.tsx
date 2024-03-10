import { useState } from 'react';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import {
  Button,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DownloadIcon from '@mui/icons-material/Download';
import PublishIcon from '@mui/icons-material/Publish';
import { Event, EventState } from '@lems/types';
import { apiFetch } from '../../lib/utils/fetch';

interface EventPanelProps {
  event: WithId<Event>;
  eventState: WithId<EventState>;
}

const EventPanel: React.FC<EventPanelProps> = ({ event, eventState: initialEventState }) => {
  const router = useRouter();
  const [eventState, setEventState] = useState(initialEventState);
  const [endEventDialogOpen, setEndEventDialogOpen] = useState(false);
  const [allowExportsDialogOpen, setAllowExportsDialogOpen] = useState(false);

  const endEvent = () => {
    apiFetch(`/api/events/${event._id}/state`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true })
    }).then(() => {
      setEndEventDialogOpen(false);
      setEventState(eventState => {
        return { ...eventState, completed: true };
      });
      enqueueSnackbar('האירוע הסתיים בהצלחה', { variant: 'success' });
      router.reload();
    });
  };

  const allowExports = () => {
    apiFetch(`/api/events/${event._id}/state`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allowTeamExports: true })
    }).then(() => {
      setAllowExportsDialogOpen(false);
      setEventState(eventState => {
        return { ...eventState, allowTeamExports: true };
      });
      enqueueSnackbar('קבוצות יכולות כעת להוריד את תוצאות האירוע.', { variant: 'success' });
    });
  };

  return (
    <>
      <Grid container component={Paper} p={2} alignItems="center" spacing={4}>
        <Grid lg={4} md={6} xs={12}>
          <Button
            variant="contained"
            startIcon={<DoneAllIcon />}
            disabled={eventState.completed}
            onClick={e => {
              e.preventDefault();
              setEndEventDialogOpen(true);
            }}
            fullWidth
          >
            סיום האירוע
          </Button>
        </Grid>
        <Grid lg={4} md={6} xs={12}>
          <Button variant="contained" startIcon={<DownloadIcon />} fullWidth disabled>
            הורדת תוצאות האירוע
          </Button>
        </Grid>
        <Grid lg={4} md={6} xs={12}>
          <Button
            variant="contained"
            startIcon={<PublishIcon />}
            fullWidth
            onClick={e => {
              e.preventDefault();
              setAllowExportsDialogOpen(true);
            }}
            disabled={!eventState.completed || eventState.allowTeamExports}
          >
            פרסום התוצאות ב-Dashboard
          </Button>
        </Grid>
      </Grid>
      <Dialog
        open={endEventDialogOpen}
        onClose={() => setEndEventDialogOpen(false)}
        aria-labelledby="end-event-title"
        aria-describedby="end-event-description"
      >
        <DialogTitle id="end-event-title">סיום האירוע</DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-description">
            פעולה זו תסמן שהאירוע הסתיים ותפתח את מסכי ניתוח האירוע. לא ניתן לחזור אחורה לאחר ביצוע
            הפעולה. האם אתם בטוחים שברצונכם לסיים את האירוע?{' '}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEndEventDialogOpen(false)}>ביטול</Button>
          <Button onClick={endEvent} autoFocus>
            אישור
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={allowExportsDialogOpen}
        onClose={() => setAllowExportsDialogOpen(false)}
        aria-labelledby="allow-exports-title"
        aria-describedby="allow-exports-description"
      >
        <DialogTitle id="allow-exports-title">סיום האירוע</DialogTitle>
        <DialogContent>
          <DialogContentText id="allow-exports-description">
            פעולה זו תסמן שהאירוע הסתיים ותפתח את מסכי ניתוח האירוע. לא ניתן לחזור אחורה לאחר ביצוע
            הפעולה. האם אתם בטוחים שברצונכם לסיים את האירוע?{' '}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAllowExportsDialogOpen(false)}>ביטול</Button>
          <Button onClick={allowExports} autoFocus>
            אישור
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EventPanel;
