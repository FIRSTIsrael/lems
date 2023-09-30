import { TableRow, TableCell } from '@mui/material';
import { localizedMatchType } from '../../localization/field';
import dayjs from 'dayjs';
import { WithId } from 'mongodb';
import BooleanIcon from '../general/boolean-icon';
import ScoresheetStatusIcon from './scoresheet-status-icon';
import { Event, EventState, RobotGameMatch, Scoresheet } from '@lems/types';
import NextLink from 'next/link';

interface Props {
  event: WithId<Event>;
  match: WithId<RobotGameMatch>;
  scoresheets: Array<WithId<Scoresheet>>;
  eventState: EventState;
}

const MatchRow: React.FC<Props> = ({ event, match, scoresheets, eventState }) => {
  return (
    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell component="th">
        {localizedMatchType[match.type]} #{match.number}
        <br />
        {dayjs(match.scheduledTime).format('HH:mm')}
      </TableCell>
      {match.participants.map((participant, index) => {
        const scoresheet = scoresheets.find(
          scoresheet =>
            scoresheet.matchId === match?._id && scoresheet.teamId === participant.teamId
        );
        return scoresheet ? (
          <NextLink
            href={`/event/${event._id}/team/${scoresheet.teamId}/scoresheet/${scoresheet._id}`}
            key={match._id.toString()}
            legacyBehavior
          >
            <TableCell align="center">
              {match.number === eventState.currentMatch + 1 ? (
                <>
                  <BooleanIcon condition={participant.ready} />
                  <br />
                </>
              ) : (
                match.number < eventState.currentMatch + 1 &&
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
        ) : (
          <TableCell key={match.number + index} />
        );
      })}
    </TableRow>
  );
};

export default MatchRow;
