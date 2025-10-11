import { WithId, ObjectId } from 'mongodb';
import { Modal, Paper, Typography } from '@mui/material';
import { FllEvent } from '@lems/types';
import EventSelector from './event-selector';

interface EventSelectorModalProps {
  title: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  events: Array<WithId<FllEvent>>;
  onSelect: (eventId: string | ObjectId, divisionId?: string | ObjectId) => void;
}

const EventSelectorModal: React.FC<EventSelectorModalProps> = ({
  title,
  open,
  setOpen,
  events,
  onSelect
}) => {
  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <Paper
        elevation={0}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 2
        }}
      >
        <Typography variant="h2" pb={2} textAlign="center">
          {title}
        </Typography>
        <EventSelector events={events} includeDivisions onChange={onSelect} />
      </Paper>
    </Modal>
  );
};

export default EventSelectorModal;
