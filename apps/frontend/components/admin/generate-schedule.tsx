import { WithId } from 'mongodb';
import { Button, ButtonProps } from '@mui/material';
import NoteAddRoundedIcon from '@mui/icons-material/NoteAddRounded';
import { Event } from '@lems/types';

interface GenerateScheduleButtonProps extends ButtonProps {
  event: WithId<Event>;
}

const GenerateScheduleButton: React.FC<GenerateScheduleButtonProps> = ({ event, ...props }) => {
  return (
    <>
      <Button variant="contained" startIcon={<NoteAddRoundedIcon />} disabled={true} {...props}>
        יצירת לוח זמנים
      </Button>
    </>
  );
};

export default GenerateScheduleButton;
