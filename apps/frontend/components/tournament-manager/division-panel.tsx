import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import { Division, DivisionState, JudgingCategoryTypes } from '@lems/types';
import { localizedJudgingCategory } from '@lems/season';
import { apiFetch } from '../../lib/utils/fetch';
import ExportAction from './export-action';
import {
  Button,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography
} from '@mui/material';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import PublishIcon from '@mui/icons-material/Publish';
import Grid from '@mui/material/Grid2';
import { red } from '@mui/material/colors';

interface DivisionPanelProps {
  division: WithId<Division>;
  divisionState: WithId<DivisionState>;
}

const DivisionPanel: React.FC<DivisionPanelProps> = ({
  division,
  divisionState: initialDivisionState
}) => {
  const router = useRouter();
  const [divisionState, setDivisionState] = useState(initialDivisionState);
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

  const handleDownloadResults = () => {
    enqueueSnackbar('הורדת תוצאות האירוע תהיה זמינה בקרוב', { variant: 'info' });
  };

  return (
    <>
      <Paper sx={{ borderRadius: 3, boxShadow: 2, p: 3, textAlign: 'center' }}>
        <Typography variant="h1" pb={3}>
          ניהול האירוע
        </Typography>
        <Grid container spacing={2}>
          {JudgingCategoryTypes.map(category => (
            <React.Fragment key={category}>
              <Grid size={6}>
                <ExportAction division={division} path={`/rubrics/${category}`} sx={{ m: 1 }}>
                  ייצוא מחווני {localizedJudgingCategory[category].name}
                </ExportAction>
              </Grid>
            </React.Fragment>
          ))}

          <Grid size={6}>
            <ExportAction division={division} path="/scores" sx={{ m: 1 }}>
              ייצוא תוצאות זירה
            </ExportAction>
          </Grid>
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
          <Button
            variant="contained"
            startIcon={<DoneAllIcon />}
            disabled={divisionState.completed}
            onClick={e => {
              e.preventDefault();
              setEndDivisionDialogOpen(true);
            }}
            fullWidth
            sx={{ backgroundColor: red['A200'], color: 'white' }}
          >
            סיום האירוע
          </Button>
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

export default DivisionPanel;
