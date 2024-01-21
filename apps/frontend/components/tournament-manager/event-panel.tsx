import { useState } from 'react';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import {
  Button,
  Paper,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
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

  return (
    <>
      <Stack component={Paper} p={2} justifyContent="center" direction="row" spacing={4}>
        <Button
          variant="contained"
          sx={{ minWidth: 200 }}
          startIcon={<DoneAllIcon />}
          disabled={eventState.completed}
          onClick={e => {
            e.preventDefault();
            setEndEventDialogOpen(true);
          }}
        >
          סיום האירוע
        </Button>
        <Button variant="contained" sx={{ minWidth: 200 }} startIcon={<DownloadIcon />} disabled>
          הורדת תוצאות האירוע
        </Button>
        <Button variant="contained" sx={{ minWidth: 200 }} startIcon={<PublishIcon />} disabled>
          פרסום המחוונים ב-Dashboard
        </Button>
      </Stack>
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
    </>
  );
};

export default EventPanel;
