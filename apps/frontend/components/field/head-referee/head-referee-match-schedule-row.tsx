import { WithId } from 'mongodb';
import dayjs from 'dayjs';
import { TableCell, TableRow } from '@mui/material';
import {
  RobotGameMatch,
  RobotGameTable,
  EventState,
  Scoresheet,
  Event,
  MATCH_LENGTH
} from '@lems/types';
import StyledTeamTooltip from '../../general/styled-team-tooltip';
import BooleanIcon from '../../general/boolean-icon';
import EditScoresheetButton from './edit-scoresheet-button';

interface HeadRefereeMatchScheduleRowProps {
  event: WithId<Event>;
  eventState: WithId<EventState>;
  tables: Array<WithId<RobotGameTable>>;
  match: WithId<RobotGameMatch>;
  scoresheets: Array<WithId<Scoresheet>>;
}

const HeadRefereeMatchScheduleRow: React.FC<HeadRefereeMatchScheduleRowProps> = ({
  event,
  eventState,
  tables,
  match,
  scoresheets
}) => {
  return (
    <TableRow
      sx={{
        backgroundColor: match._id === eventState.activeMatch ? '#e6f7e7' : undefined,
        '&:last-child td, &:last-child th': { border: 0 }
      }}
    >
      <TableCell align="center">{match.number}</TableCell>
      <TableCell align="center">{dayjs(match.scheduledTime).format('HH:mm')}</TableCell>
      <TableCell align="center">
        {dayjs(match.scheduledTime).add(MATCH_LENGTH, 'seconds').format('HH:mm')}
      </TableCell>
      {tables.map(table => {
        const participant = match.participants.find(p => p.tableId === table._id);
        if (participant?.teamId) {
          const scoresheet = scoresheets.find(
            scoresheet =>
              scoresheet.stage === match.stage &&
              scoresheet.round === match.round &&
              scoresheet.teamId === participant.teamId
          );
          return (
            scoresheet && (
              <TableCell align="center" key={scoresheet._id.toString()}>
                {match._id === eventState.loadedMatch ? (
                  <>
                    <BooleanIcon condition={participant.ready} />
                    <br />
                    {participant.team && <StyledTeamTooltip team={participant.team} />}
                  </>
                ) : match.status === 'completed' && scoresheet ? (
                  <>
                    <EditScoresheetButton
                      active={!!participant.team?.registered}
                      status={scoresheet.status}
                      score={scoresheet.data?.score}
                      gp={scoresheet.data?.gp?.value}
                      href={`/event/${event._id}/team/${scoresheet.teamId}/scoresheet/${scoresheet._id}`}
                    >
                      #{participant.team?.number}
                    </EditScoresheetButton>
                    <br />
                  </>
                ) : (
                  participant.team && <StyledTeamTooltip team={participant.team} />
                )}
              </TableCell>
            )
          );
        }
        return <TableCell key={match.number + table._id.toString()} />;
      })}
    </TableRow>
  );
};

export default HeadRefereeMatchScheduleRow;
