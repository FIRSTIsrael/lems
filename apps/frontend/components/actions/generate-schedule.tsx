import { Button, ButtonProps } from '@mui/material';
import NoteAddRoundedIcon from '@mui/icons-material/NoteAddRounded';
import { ObjectId } from "mongodb";

interface GenerateScheduleActionProps {
  eventId: ObjectId;
}

const GenerateScheduleAction = ({
                                  eventId,
                                  ...props
                                }: GenerateScheduleActionProps & ButtonProps) => {
  return (
    <>
      <Button
        variant="contained"
        startIcon={<NoteAddRoundedIcon />}
        // color="light"
        disabled={true}
        {...props}
      >
        יצירת לוח זמנים
      </Button>
    </>
  );
};

export default GenerateScheduleAction;
