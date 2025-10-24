import { WithId } from 'mongodb';
import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  ButtonProps
} from '@mui/material';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import { Team } from '@lems/types';
import { red } from '@mui/material/colors';
import TeamSelection from '../general/team-selection';

interface DisqualificationButtonProps extends ButtonProps {
  teams: Array<WithId<Team>>;
  disqualifyTeam: (team: WithId<Team>) => void;
  disabled?: boolean;
}

const DisqualificationButton: React.FC<DisqualificationButtonProps> = ({
  teams,
  disqualifyTeam,
  disabled = false,
  ...props
}) => {
  const [open, setOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<WithId<Team> | null>(null);

  return (
    <>
      <Button
        {...props}
        variant="contained"
        endIcon={<BlockRoundedIcon />}
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        פסילת קבוצה
      </Button>
      <Dialog
        open={open}
        fullWidth
        maxWidth="sm"
        onClose={() => setOpen(false)}
        aria-labelledby="add-team-dialog-title"
        aria-describedby="add-team-dialog-description"
      >
        <DialogTitle id="add-team-dialog-title" color={red[500]}>
          אזהרה! פסילת קבוצה
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="add-team-description" mb={2}>
            בחרו קבוצה לפסול מדיוני הפרסים. שימו לב שפעולה זו לא ניתנת לביטול ותמנע מהקבוצה לזכות
            בפרסים בתחרות זו.
          </DialogContentText>
          <TeamSelection teams={teams} value={selectedTeam} setTeam={setSelectedTeam} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} autoFocus>
            ביטול
          </Button>
          <Button
            disabled={!selectedTeam}
            onClick={() => {
              if (selectedTeam) {
                disqualifyTeam(selectedTeam);
                setOpen(false);
                setSelectedTeam(null);
              }
            }}
          >
            אישור
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DisqualificationButton;
