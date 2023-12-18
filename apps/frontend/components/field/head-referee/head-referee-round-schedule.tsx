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
  RobotGameMatchStage,
  EventScheduleEntry,
  Scoresheet,
  Event,
  EventState
} from '@lems/types';
import { localizedMatchStage } from '../../../localization/field';
import HeadRefereeMatchScheduleRow from './head-referee-match-schedule-row';

interface ReportRoundScheduleProps {
  event: WithId<Event>;
  eventState: WithId<EventState>;
  roundStage: RobotGameMatchStage;
  roundNumber: number;
  matches: Array<WithId<RobotGameMatch>>;
  tables: Array<WithId<RobotGameTable>>;
  scoresheets: Array<WithId<Scoresheet>>;
  eventSchedule: Array<EventScheduleEntry>;
}

const HeadRefereeRoundSchedule: React.FC<ReportRoundScheduleProps> = ({
  event,
  eventState,
  roundStage,
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
            <TableCell colSpan={3 + tables.length} align="center">
              {localizedMatchStage[roundStage]} #{roundNumber}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="center">מקצה</TableCell>
            <TableCell align="center">התחלה</TableCell>
            <TableCell align="center">סיום</TableCell>
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
                <TableCell />
                <TableCell align="center">{dayjs(c.startTime).format('HH:mm')}</TableCell>
                <TableCell align="center">{dayjs(c.endTime).format('HH:mm')}</TableCell>
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
