import { Event } from '@lems/types';
import { WithId, ObjectId } from 'mongodb';
import { Avatar, ListItemAvatar, ListItemButton, ListItemText, Stack } from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import EventIcon from '@mui/icons-material/EventOutlined';
import { stringifyTwoDates } from '../../lib/utils/dayjs';
import { getDivisionColor, getDivisionBackground } from '../../lib/utils/colors';

interface EventSelectorProps {
  events: Array<WithId<Event>>;
  onChange: (eventId: string | ObjectId) => void;
  isEventDisabled?: (event: WithId<Event>) => boolean;
}

const EventSelector: React.FC<EventSelectorProps> = ({ events, onChange, isEventDisabled }) => {
  return (
    <Stack direction="column" spacing={2}>
      {events.map(event => {
        return (
          <ListItemButton
            key={event.name}
            onClick={() => onChange(event._id)}
            disabled={isEventDisabled ? isEventDisabled(event) : false}
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
            {isEventDisabled && isEventDisabled(event) && <WarningAmberRoundedIcon />}
          </ListItemButton>
        );
      })}
    </Stack>
  );
};

export default EventSelector;
