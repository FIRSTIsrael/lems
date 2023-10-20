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
  Team,
  MATCH_LENGTH,
  RobotGameMatch,
  RobotGameTable,
  RobotGameMatchStage
} from '@lems/types';
import { localizedMatchStage } from '../../localization/field';
import EditableTeamCell from './editable-team-cell';

interface RoundScheduleEditorRowProps {
  match: WithId<RobotGameMatch>;
  tables: Array<WithId<RobotGameTable>>;
  teams: Array<WithId<Team>>;
}

const RoundScheduleEditorRow: React.FC<RoundScheduleEditorRowProps> = ({
  match,
  tables,
  teams
}) => {
  const startTime = dayjs(match.scheduledTime);

  return (
    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell>{startTime.format('HH:mm')}</TableCell>
      <TableCell>{startTime.add(MATCH_LENGTH, 'seconds').format('HH:mm')}</TableCell>
      {tables.map(table => {
        const team = teams.find(
          t => t._id === match.participants.find(p => p.tableId === table._id)?.teamId
        );

        return (
          <TableCell key={table._id.toString()} align="center">
            <EditableTeamCell teams={teams} initialTeam={team || null} />
          </TableCell>
        );
      })}
    </TableRow>
  );
};

interface RoundScheduleEditorProps {
  roundStage: RobotGameMatchStage;
  roundNumber: number;
  matches: Array<WithId<RobotGameMatch>>;
  tables: Array<WithId<RobotGameTable>>;
  teams: Array<WithId<Team>>;
}

const RoundScheduleEditor: React.FC<RoundScheduleEditorProps> = ({
  roundStage,
  roundNumber,
  matches,
  tables,
  teams
}) => {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell colSpan={2 + tables.length} align="center">
              {localizedMatchStage[roundStage]} #{roundNumber}
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
            <RoundScheduleEditorRow match={m} tables={tables} teams={teams} key={m.number} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RoundScheduleEditor;
