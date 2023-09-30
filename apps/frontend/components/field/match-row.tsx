import { TableRow, TableCell } from '@mui/material';
import { localizedMatchType } from '../../localization/field';
import dayjs from 'dayjs';
import { WithId } from 'mongodb';
import BooleanIcon from '../general/boolean-icon';
import ScoresheetStatusIcon from './scoresheet-status-icon';
import { Event, EventState, RobotGameMatch, Scoresheet, Team } from '@lems/types';
import NextLink from 'next/link';

interface Props {
  event: WithId<Event>;
  match: WithId<RobotGameMatch>;
  scoresheets: Array<WithId<Scoresheet>>;
  eventState: EventState;
}

const MatchRow: React.FC<Props> = ({ event, match, scoresheets, eventState }) => {
  //TODO: rewrite with new match schema

  return (
    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      Hello there
      {/* {firstMatch && (
        <TableCell component="th">
          {localizedMatchType[firstMatch.type]} #{matchNumber}
          <br />
          {dayjs(firstMatch.startTime).format('HH:mm')}
        </TableCell>
      )}
      {matches.map((match, index) => {
        const scoresheet = scoresheets.find(scoresheet => scoresheet.matchId === match?._id);
        return match && scoresheet ? (
          <NextLink
            href={`/event/${event._id}/team/${match.team}/scoresheet/${scoresheet._id}`}
            key={match._id.toString()}
            legacyBehavior
          >
            <TableCell align="center">
              {parseInt(matchNumber) === eventState.activeMatch + 1 ? (
                <>
                  <BooleanIcon condition={match.ready} />
                  <br />
                </>
              ) : (
                parseInt(matchNumber) < eventState.activeMatch + 1 &&
                scoresheet && (
                  <>
                    <ScoresheetStatusIcon status={scoresheet.status} />
                    <br />
                  </>
                )
              )}
              קבוצה #{teams.find(t => t._id === match.team)?.number}
            </TableCell>
          </NextLink>
        ) : (
          <TableCell key={matchNumber + index} />
        );
      })} */}
    </TableRow>
  );
};

export default MatchRow;
