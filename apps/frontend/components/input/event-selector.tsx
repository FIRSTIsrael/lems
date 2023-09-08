import { Event } from '@lems/types';
import { WithId, ObjectId } from 'mongodb';
import {
  Avatar,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Stack,
  Typography
} from '@mui/material';
import EventIcon from '@mui/icons-material/EventOutlined';
import { stringifyTwoDates } from '../../lib/utils/dayjs';
import { getDivisionColor, getDivisionBackground } from '../../lib/utils/colors';

interface Props {
  events: Array<WithId<Event>>;
  onChange: (eventId: string | ObjectId) => void;
}

const EventSelector: React.FC<Props> = ({ events, onChange }) => {
  return (
    <Stack direction="column" spacing={2}>
      <Typography variant="h2" textAlign={'center'}>
        בחירת אירוע
      </Typography>
      {events.map(event => {
        return (
          <ListItemButton
            key={event.name}
            onClick={() => onChange(event._id)}
            sx={{ borderRadius: 2 }}
            component="a"
            dense
          >
            <ListItemAvatar>
              <Avatar
                sx={{
                  color: getDivisionColor(event.color),
                  backgroundColor: getDivisionBackground(event.color)
                }}
              >
                <EventIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={event.name}
              secondary={stringifyTwoDates(event.startDate, event.endDate)}
            />
          </ListItemButton>
        );
      })}
    </Stack>
  );
};

export default EventSelector;
