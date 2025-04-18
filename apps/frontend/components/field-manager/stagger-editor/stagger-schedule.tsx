import { WithId } from 'mongodb';
import {
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer
} from '@mui/material';
import { Team, RobotGameMatch } from '@lems/types';
import MatchRow from './stagger-schedule-match-row';
import ActionRow from './stagger-schedule-action-row';

interface StaggerScheduleProps {
  teams: Array<WithId<Team>>;
  currentMatch: WithId<RobotGameMatch> | null;
  nextMatch: WithId<RobotGameMatch> | null;
  nextNextMatch: WithId<RobotGameMatch> | null;
  onSwitchParticipants: (
    fromMatch: WithId<RobotGameMatch>,
    toMatchId: WithId<RobotGameMatch>,
    participantIndex: number
  ) => void;
  onMergeMatches: (fromMatch: WithId<RobotGameMatch>, toMatch: WithId<RobotGameMatch>) => void;
}

const StaggerSchedule: React.FC<StaggerScheduleProps> = ({
  teams,
  currentMatch,
  nextMatch,
  nextNextMatch,
  onSwitchParticipants,
  onMergeMatches
}) => {
  if (!currentMatch || !nextMatch) {
    return <Typography>לא נותרו מספיק מקצים בסבב הנוכחי.</Typography>;
  }

  const tables = currentMatch.participants.map(participant => participant.tableName);

  return (
    <TableContainer sx={{ border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'auto', mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center">מקצה</TableCell>
            <TableCell align="center">התחלה</TableCell>
            {tables.map((tableName, index) => (
              <TableCell key={index} align="center">
                שולחן {tableName}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <MatchRow match={currentMatch} teams={teams} />
          <ActionRow
            fromMatch={currentMatch}
            toMatch={nextMatch}
            teams={teams}
            allowMerge
            onSwitchParticipants={onSwitchParticipants}
            onMergeMatches={onMergeMatches}
          />
          <MatchRow match={nextMatch} teams={teams} />
          {nextNextMatch && (
            <ActionRow
              fromMatch={nextMatch}
              toMatch={nextNextMatch}
              teams={teams}
              onSwitchParticipants={onSwitchParticipants}
              onMergeMatches={onMergeMatches}
            />
          )}
          {nextNextMatch && <MatchRow match={nextNextMatch} teams={teams} />}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default StaggerSchedule;
