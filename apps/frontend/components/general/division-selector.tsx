import { useMemo } from 'react';
import dayjs from 'dayjs';
import { Division } from '@lems/types';
import { WithId, ObjectId } from 'mongodb';
import { Avatar, ListItemAvatar, ListItemButton, ListItemText, Stack } from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import EventIcon from '@mui/icons-material/EventOutlined';
import { stringifyTwoDates } from '../../lib/utils/dayjs';

interface DivisionSelectorProps {
  divisions: Array<WithId<Division>>;
  onChange: (divisionId: string | ObjectId) => void;
  getDivisionDisabled?: (division: WithId<Division>) => boolean;
}

const DivisionSelector: React.FC<DivisionSelectorProps> = ({
  divisions,
  onChange,
  getDivisionDisabled
}) => {
  const sortedDivisions = useMemo(
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
      {sortedDivisions.map(division => {
        return (
          <ListItemButton
            key={division.name}
            onClick={() => onChange(division._id)}
            disabled={getDivisionDisabled?.(division)}
            sx={{ borderRadius: 2 }}
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
                <EventIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={division.name}
              secondary={stringifyTwoDates(division.startDate, division.endDate)}
            />
            {getDivisionDisabled?.(division) && <WarningAmberRoundedIcon />}
          </ListItemButton>
        );
      })}
    </Stack>
  );
};

export default DivisionSelector;
