import { useMemo } from 'react';
import dayjs from 'dayjs';
import { Event } from '@lems/types';
import { WithId, ObjectId } from 'mongodb';
import { Avatar, ListItemAvatar, ListItemButton, ListItemText, Stack } from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import EventIcon from '@mui/icons-material/EventOutlined';
import { stringifyTwoDates } from '../../lib/utils/dayjs';
import { getDivisionColor, getDivisionBackground } from '../../lib/utils/colors';

interface EventSelectorProps {
  divisions: Array<WithId<Event>>;
  onChange: (divisionId: string | ObjectId) => void;
  getEventDisabled?: (division: WithId<Event>) => boolean;
}

const EventSelector: React.FC<EventSelectorProps> = ({ divisions, onChange, getEventDisabled }) => {
  const sortedEvents = useMemo(
    () =>
      divisions.sort((a, b) => {
        const diffA = dayjs().diff(dayjs(a.startDate), 'days', true);
        const diffB = dayjs().diff(dayjs(b.startDate), 'days', true);

        if (diffB > 1 && diffA <= 1) return -1;
        if (diffA > 1 && diffB <= 1) return 1;
        if (diffA > 1 && diffB > 1) return diffA - diffB;
        return diffB - diffA;
      }),
    [divisions]
  );

  return (
    <Stack direction="column" spacing={2}>
      {sortedEvents.map(division => {
        return (
          <ListItemButton
            key={division.name}
            onClick={() => onChange(division._id)}
            disabled={getEventDisabled?.(division)}
            sx={{ borderRadius: 2 }}
            component="a"
            dense
          >
            <ListItemAvatar>
              <Avatar
                sx={{
                  color: getDivisionColor(division.color),
                  backgroundColor: getDivisionBackground(division.color)
                }}
              >
                <EventIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={division.name}
              secondary={stringifyTwoDates(division.startDate, division.endDate)}
            />
            {getEventDisabled?.(division) && <WarningAmberRoundedIcon />}
          </ListItemButton>
        );
      })}
    </Stack>
  );
};

export default EventSelector;
