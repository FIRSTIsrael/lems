import { useState } from 'react';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import {
  Grid,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { Team } from '@lems/types';

interface Props {
  team: WithId<Team>;
}

const RubricHeader: React.FC<Props> = ({ team }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={10}>
          <Typography
            variant="h2"
            fontSize="1.25rem"
          >{`קבוצה #${team.number} ${team.name}  מ${team.affiliation.institution}, ${team.affiliation.city}`}</Typography>
        </Grid>
        <Grid item xs={2}>
          <Button variant="contained" color="primary" onClick={handleClickOpen}>
            חזור
          </Button>
        </Grid>
      </Grid>
      <Dialog open={open} onClose={handleClose} aria-describedby="return-without-saving-warn">
        <DialogTitle>{'רגע! המחוון לא שמור'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="return-warning">
            אתם עומדים לחזור ללוח הזמנים מבלי לשמור את המחוון. האם ברצונכם להמשיך?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button variant="contained" color="primary" onClick={handleClose}>
            לא
          </Button>
          <Button onClick={() => router.back()}>כן</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RubricHeader;
