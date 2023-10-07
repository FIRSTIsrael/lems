import { WithId } from 'mongodb';
import dayjs from 'dayjs';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  RobotGameMatch,
  RobotGameTable,
  RobotGameMatchType,
  EventScheduleEntry,
  Scoresheet,
  Event,
  EventState
} from '@lems/types';
import { localizedMatchType } from '../../../localization/field';
import HeadRefereeMatchScheduleRow from './head-referee-match-schedule-row';

interface ReportRoundScheduleProps {
  event: WithId<Event>;
  eventState: WithId<EventState>;
  roundType: RobotGameMatchType;
  roundNumber: number;
  matches: Array<WithId<RobotGameMatch>>;
  tables: Array<WithId<RobotGameTable>>;
  scoresheets: Array<WithId<Scoresheet>>;
  eventSchedule: Array<EventScheduleEntry>;
}

const HeadRefereeRoundSchedule: React.FC<ReportRoundScheduleProps> = ({
  event,
  eventState,
  roundType,
  roundNumber,
  matches,
  tables,
  scoresheets,
  eventSchedule
}) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell colSpan={2 + tables.length} align="center">
              {localizedMatchType[roundType]} #{roundNumber}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>התחלה</TableCell>
            <TableCell>סיום</TableCell>
            {tables.map(table => (
              <TableCell key={table._id.toString()} align="center">
                {`שולחן ${table.name}`}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {matches.map(m => (
            <HeadRefereeMatchScheduleRow
              key={m.number}
              event={event}
              eventState={eventState}
              tables={tables}
              match={m}
              scoresheets={scoresheets}
            />
          ))}
          {eventSchedule
            .filter(c => {
              const timeDiff = dayjs(c.startTime).diff(
                matches[matches.length - 1].scheduledTime,
                'minutes'
              );
              return timeDiff > 0 && timeDiff <= 15;
            })
            .map((c, index) => (
              <TableRow key={c.name + index}>
                <TableCell>{dayjs(c.startTime).format('HH:mm')}</TableCell>
                <TableCell>{dayjs(c.endTime).format('HH:mm')}</TableCell>
                <TableCell colSpan={tables.length} align="center">
                  {c.name}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default HeadRefereeRoundSchedule;
