import { useMemo } from 'react';
import dayjs from 'dayjs';
import { Division, FllEvent } from '@lems/types';
import { WithId, ObjectId } from 'mongodb';
import { Avatar, ListItemAvatar, ListItemButton, ListItemText, List } from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import HomeIcon from '@mui/icons-material/HomeRounded';
import EventIcon from '@mui/icons-material/EventOutlined';
import { stringifyTwoDates } from '../../lib/utils/dayjs';
import { getBackgroundColor } from '../../lib/utils/theme';

interface EventSelectorProps {
  events: Array<WithId<FllEvent>>;
  includeDivisions?: boolean;
  disableParentSelection?: boolean;
  onChange: (eventId: string | ObjectId, divisionId?: string | ObjectId) => void;
  getEventDisabled?: (event: WithId<FllEvent>) => boolean;
  getDivisionDisabled?: (division: WithId<Division>) => boolean;
}

const EventSelector: React.FC<EventSelectorProps> = ({
  events,
  includeDivisions = false,
  onChange,
  getEventDisabled,
  getDivisionDisabled
}) => {
  const sortedEvents = useMemo(
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
    <List>
      {sortedEvents.map(event => {
        const disabled =
          getEventDisabled?.(event) ||
          (!event.enableDivisions &&
            !!event.divisions?.[0] &&
            getDivisionDisabled?.(event.divisions[0]));

        return (
          <>
            <ListItemButton
              key={String(event._id)}
              onClick={() => onChange(event._id)}
              disabled={disabled}
              sx={{ borderRadius: 2 }}
              component="a"
              dense
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    color: event.color ?? '#a7ab99',
                    backgroundColor: getBackgroundColor(event.color ?? '#a7ab99', 'light')
                  }}
                >
                  <EventIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={event.name}
                secondary={stringifyTwoDates(event.startDate, event.endDate)}
              />
              {disabled && <WarningAmberRoundedIcon />}
            </ListItemButton>
            {includeDivisions &&
              event.enableDivisions &&
              event.divisions?.map(division => (
                <ListItemButton
                  key={String(division._id)}
                  onClick={() => onChange(event._id, division._id)}
                  disabled={getDivisionDisabled?.(division)}
                  sx={{ borderRadius: 2, pl: 4 }}
                  component="a"
                  dense
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        color: division.color,
                        backgroundColor: division.color + '1a'
                      }}
                    >
                      <HomeIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={`בית ${division.name}`} />
                  {getDivisionDisabled?.(division) && <WarningAmberRoundedIcon />}
                </ListItemButton>
              ))}
          </>
        );
      })}
    </List>
  );
};

export default EventSelector;
