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
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import { Team } from '@lems/types';
import TeamSelection from '../general/team-selection';

interface ManualAdditionButtonProps extends ButtonProps {
  additionalTeams: Array<WithId<Team>>;
  onAddTeam: (team: WithId<Team>) => void;
  disabled: boolean;
}

const ManualAdditionButton: React.FC<ManualAdditionButtonProps> = ({
  additionalTeams,
  onAddTeam,
  disabled,
  ...props
}) => {
  const [open, setOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<WithId<Team> | null>(null);

  return (
    <>
      <Button
        {...props}
        variant="contained"
        endIcon={<AddCircleOutlineRoundedIcon />}
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        הוספת קבוצה
      </Button>
      <Dialog
        open={open}
        fullWidth
        maxWidth="sm"
        onClose={() => setOpen(false)}
        aria-labelledby="add-team-dialog-title"
        aria-describedby="add-team-dialog-description"
      >
        <DialogTitle id="add-team-dialog-title">הוספת מועמדות לקבוצה</DialogTitle>
        <DialogContent>
          <DialogContentText id="add-team-description" mb={2}>
            בחרו קבוצה להעמיד לדיון הפרסים.
          </DialogContentText>
          <TeamSelection
            teams={additionalTeams}
            value={selectedTeam}
            setTeam={setSelectedTeam}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} autoFocus>
            ביטול
          </Button>
          <Button
            disabled={!selectedTeam}
            onClick={() => {
              if (selectedTeam) {
                onAddTeam(selectedTeam);
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

export default ManualAdditionButton;
