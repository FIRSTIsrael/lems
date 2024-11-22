import { useMemo } from 'react';
import dayjs from 'dayjs';
import { FllEvent, Division } from '@lems/types';
import { WithId, ObjectId } from 'mongodb';
import { Avatar, ListItemAvatar, ListItemButton, ListItemText, Stack } from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import EventIcon from '@mui/icons-material/EventOutlined';
import { stringifyTwoDates } from '../../lib/utils/dayjs';

interface EventSelectorProps {
  events: Array<WithId<FllEvent>>;
  onChange: (divisionId: string | ObjectId) => void;
  getEventDisabled?: (division: WithId<FllEvent>) => boolean;
}

const EventSelector: React.FC<EventSelectorProps> = ({ events, onChange, getEventDisabled }) => {
  const sortedDivisions = useMemo(
    () =>
      events.sort((a, b) => {
        const diffA = dayjs().diff(dayjs(a.startDate), 'days', true);
        const diffB = dayjs().diff(dayjs(b.startDate), 'days', true);

        if (diffB > 1 && diffA <= 1) return -1;
        if (diffA > 1 && diffB <= 1) return 1;
        if (diffA > 1 && diffB > 1) return diffA - diffB;
        return diffB - diffA;
      }),
    [events]
  );

  return (
    <Stack direction="column" spacing={2}>
      {sortedDivisions.map(event => {
        return (
          <ListItemButton
            key={event.name}
            onClick={() => onChange(event._id)}
            disabled={getEventDisabled?.(event)}
            sx={{ borderRadius: 2 }}
            component="a"
            dense
          >
            <ListItemAvatar>
              <Avatar
                sx={{
                  color: event.divisions?.[0]?.color,
                  backgroundColor: event.divisions?.[0]?.color + '1a'
                }}
              >
                <EventIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={event.name}
              secondary={stringifyTwoDates(event.startDate, event.endDate)}
            />
            {getEventDisabled?.(event) && <WarningAmberRoundedIcon />}
          </ListItemButton>
        );
      })}
    </Stack>
  );
};

export default EventSelector;
