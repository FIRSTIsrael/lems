import { TableRow, TableCell } from '@mui/material';
import { localizedMatchType } from '../../localization/field';
import dayjs from 'dayjs';
import { WithId } from 'mongodb';
import BooleanIcon from '../general/boolean-icon';
import ScoresheetStatusIcon from './scoresheet-status-icon';
import { Event, EventState, RobotGameMatch, Scoresheet, Team } from '@lems/types';
import NextLink from 'next/link';

interface MatchRowProps {
  event: WithId<Event>;
  matchNumber: string;
  matches: Array<WithId<RobotGameMatch>>;
  scoresheets: Array<WithId<Scoresheet>>;
  eventState: EventState;
  teams: Array<WithId<Team>>;
}

const MatchRow: React.FC<MatchRowProps> = ({
  event,
  matchNumber,
  matches,
  scoresheets,
  eventState,
  teams
}) => {
  const firstMatch = matches.find(match => match !== undefined);

  return (
    <TableRow key={matchNumber} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      {firstMatch && (
        <TableCell component="th">
          {localizedMatchType[firstMatch.type]} #{matchNumber}
          <br />
          {dayjs(firstMatch.time).format('HH:mm')}
        </TableCell>
      )}
      {matches.map((match, index) => {
        const scoresheet = scoresheets.find(scoresheet => scoresheet.match === match?._id);
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
      })}
    </TableRow>
  );
};

export default MatchRow;
