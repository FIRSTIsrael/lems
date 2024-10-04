import { WithId } from 'mongodb';
import { useState } from 'react';
import {
  Button,
  ButtonProps,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { JudgingDeliberation } from '@lems/types';

interface EndDeliberationStageButtonProps extends ButtonProps {
  deliberation: WithId<JudgingDeliberation>;
  stageName: string;
  endStage: (deliberation: WithId<JudgingDeliberation>) => void;
}

const EndDeliberationStageButton: React.FC<EndDeliberationStageButtonProps> = ({
  deliberation,
  stageName,
  endStage,
  ...props
}) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <Button
        {...props}
        endIcon={<ChevronLeftIcon />}
        variant="contained"
        onClick={() => setOpen(true)}
        disabled={deliberation.status !== 'in-progress'}
      >
        מעבר לשלב הבא
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="end-stage-title"
        aria-describedby="end-stage-description"
      >
        <DialogTitle id="end-stage-title">נעילת שלב {stageName}</DialogTitle>
        <DialogContent>
          <DialogContentText id="end-stage-description">
            פעולה זו תנעל את שלב זה של הדיון, ולא תאפשר לאף אחד לערוך אותו יותר. האם אתם בטוחים
            שברצונכם להמשיך לשלב הבא?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>ביטול</Button>
          <Button
            onClick={() => {
              endStage(deliberation);
              setOpen(false);
            }}
            autoFocus
          >
            אישור
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EndDeliberationStageButton;
