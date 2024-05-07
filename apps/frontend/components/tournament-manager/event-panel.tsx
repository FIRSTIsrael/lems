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
  division: WithId<Event>;
  divisionState: WithId<EventState>;
}

const EventPanel: React.FC<EventPanelProps> = ({ division, divisionState: initialEventState }) => {
  const router = useRouter();
  const [divisionState, setEventState] = useState(initialEventState);
  const [endEventDialogOpen, setEndEventDialogOpen] = useState(false);
  const [allowExportsDialogOpen, setAllowExportsDialogOpen] = useState(false);

  const endEvent = () => {
    apiFetch(`/api/divisions/${division._id}/state`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true })
    }).then(() => {
      setEndEventDialogOpen(false);
      setEventState(divisionState => {
        return { ...divisionState, completed: true };
      });
      enqueueSnackbar('האירוע הסתיים בהצלחה', { variant: 'success' });
      router.reload();
    });
  };

  const allowExports = () => {
    apiFetch(`/api/divisions/${division._id}/state`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allowTeamExports: true })
    }).then(() => {
      setAllowExportsDialogOpen(false);
      setEventState(divisionState => {
        return { ...divisionState, allowTeamExports: true };
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
            disabled={divisionState.completed}
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
            disabled={!divisionState.completed || divisionState.allowTeamExports}
          >
            פרסום התוצאות ב-Dashboard
          </Button>
        </Grid>
      </Grid>
      <Dialog
        open={endEventDialogOpen}
        onClose={() => setEndEventDialogOpen(false)}
        aria-labelledby="end-division-title"
        aria-describedby="end-division-description"
      >
        <DialogTitle id="end-division-title">סיום האירוע</DialogTitle>
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
        <DialogTitle id="allow-exports-title">פרסום תוצאות</DialogTitle>
        <DialogContent>
          <DialogContentText id="allow-exports-description">
            פעולה זו תאפשר לקבוצות שהתחרו באירוע להוריד את המחוונים ודפי הניקוד שלהן. לא ניתן לחזור
            אחורה לאחר ביצוע הפעולה. האם אתם בטוחים שברצונכם לאפשר את פרסום התוצאות?{' '}
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
