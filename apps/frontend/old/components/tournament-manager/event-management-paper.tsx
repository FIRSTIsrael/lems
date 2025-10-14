import { useState, Dispatch, SetStateAction } from 'react';
import { WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import { useRouter } from 'next/router';
import {
  Button,
  Paper,
  Box,
  Avatar,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import ManageIcon from '@mui/icons-material/WidgetsRounded';
import Grid from '@mui/material/Grid';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import PublishIcon from '@mui/icons-material/Publish';
import { Division, DivisionState } from '@lems/types';
import { apiFetch } from '../../lib/utils/fetch';

interface EventManagementPaperProps {
  division: WithId<Division>;
  divisionState: WithId<DivisionState>;
  setDivisionState: Dispatch<SetStateAction<WithId<DivisionState>>>;
}

const EventManagementPaper: React.FC<EventManagementPaperProps> = ({
  division,
  divisionState,
  setDivisionState
}) => {
  const router = useRouter();

  const [endDivisionDialogOpen, setEndDivisionDialogOpen] = useState(false);
  const [allowExportsDialogOpen, setAllowExportsDialogOpen] = useState(false);

  const endDivision = () => {
    apiFetch(`/api/divisions/${division._id}/state`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true })
    }).then(() => {
      setEndDivisionDialogOpen(false);
      setDivisionState(divisionState => {
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
      setDivisionState(divisionState => {
        return { ...divisionState, allowTeamExports: true };
      });
      enqueueSnackbar('קבוצות יכולות כעת להוריד את תוצאות האירוע.', { variant: 'success' });
    });
  };

  return (
    <>
      <Paper sx={{ borderRadius: 3, mb: 4, boxShadow: 2, p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            pb: 3
          }}
        >
          <Avatar
            sx={{
              bgcolor: '#e9d5ff',
              color: '#9333ea',
              width: '2rem',
              height: '2rem',
              mr: 1
            }}
          >
            <ManageIcon sx={{ fontSize: '1rem' }} />
          </Avatar>
          <Typography variant="h2" fontSize="1.25rem">
            ניהול
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid size={6}>
            <Button
              variant="contained"
              startIcon={<DoneAllIcon />}
              disabled={divisionState.completed}
              onClick={e => {
                e.preventDefault();
                setEndDivisionDialogOpen(true);
              }}
              fullWidth
            >
              סיום האירוע
            </Button>
          </Grid>
          <Grid size={6}>
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
      </Paper>
      <Dialog
        open={endDivisionDialogOpen}
        onClose={() => setEndDivisionDialogOpen(false)}
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
          <Button onClick={() => setEndDivisionDialogOpen(false)}>ביטול</Button>
          <Button onClick={endDivision} autoFocus>
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

export default EventManagementPaper;
