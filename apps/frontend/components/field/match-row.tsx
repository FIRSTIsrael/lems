import { TableRow, TableCell } from '@mui/material';
import { localizedMatchType } from '../../localization/field';
import dayjs from 'dayjs';
import { WithId } from 'mongodb';
import BooleanIcon from '../general/boolean-icon';
import ScoresheetStatusIcon from './scoresheet-status-icon';
import { Event, EventState, RobotGameMatch, RobotGameTable, Scoresheet } from '@lems/types';
import NextLink from 'next/link';

interface MatchRowProps {
  event: WithId<Event>;
  match: WithId<RobotGameMatch>;
  tables: Array<WithId<RobotGameTable>>;
  scoresheets: Array<WithId<Scoresheet>>;
  eventState: EventState;
}

const MatchRow: React.FC<MatchRowProps> = ({ event, match, tables, scoresheets, eventState }) => {
  return (
    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell component="th">
        {localizedMatchType[match.type]} #{match.number}
        <br />
        {dayjs(match.scheduledTime).format('HH:mm')}
      </TableCell>
      {tables.map(table => {
        const participant = match.participants.find(p => p.tableId === table._id);
        if (participant) {
          const scoresheet = scoresheets.find(
            scoresheet =>
              scoresheet.matchId === match?._id && scoresheet.teamId === participant.teamId
          );
          return (
            scoresheet && (
              <NextLink
                href={`/event/${event._id}/team/${scoresheet.teamId}/scoresheet/${scoresheet._id}`}
                key={scoresheet._id.toString()}
                legacyBehavior
              >
                <TableCell align="center">
                  {match._id === eventState.loadedMatch ? (
                    <>
                      <BooleanIcon condition={participant.ready} />
                      <br />
                    </>
                  ) : (
                    match.status === 'completed' &&
                    scoresheet && (
                      <>
                        <ScoresheetStatusIcon status={scoresheet.status} />
                        <br />
                      </>
                    )
                  )}
                  קבוצה #{participant.team?.number}
                </TableCell>
              </NextLink>
            )
          );
        }
        return <TableCell key={match.number + table._id.toString()} />;
      })}
    </TableRow>
  );
};

export default MatchRow;
