import { ObjectId, WithId } from 'mongodb';
import {
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Stack
} from '@mui/material';
import {
  Team,
  Scoresheet,
  JudgingSession,
  JudgingRoom,
  CoreValuesForm,
  JudgingCategoryTypes,
  JudgingCategory,
  MANDATORY_AWARD_PICKLIST_LENGTH
} from '@lems/types';
import { localizedJudgingCategory } from '@lems/season';

interface CoreAwardsDeliberationGridProps {
  teams: Array<WithId<Team>>;
  rooms: Array<WithId<JudgingRoom>>;
  sessions: Array<WithId<JudgingSession>>;
  cvForms: Array<WithId<CoreValuesForm>>;
  scoresheets: Array<WithId<Scoresheet>>;
  categoryPicklists: { [key in JudgingCategory]: Array<ObjectId> };
  disabled?: boolean;
}

const CoreAwardsDeliberationGrid: React.FC<CoreAwardsDeliberationGridProps> = ({
  teams,
  rooms,
  sessions,
  cvForms,
  scoresheets,
  categoryPicklists,
  disabled = false
}) => {
  const tableLength = MANDATORY_AWARD_PICKLIST_LENGTH;
  return (
    <TableContainer component={Paper} sx={{ width: '100%', height: '100%' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell align="center">דירוג</TableCell>
            {JudgingCategoryTypes.map(category => (
              <TableCell align="center">{localizedJudgingCategory[category].name}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {[...Array(tableLength).keys()].map(i => (
            <TableRow key={i}>
              <TableCell align="center" component="th" scope="row">
                {i + 1}
              </TableCell>
              {JudgingCategoryTypes.map(category => {
                const teamId = categoryPicklists[category][i];
                const team = teams.find(team => team._id === teamId);
                return !!team ? (
                  <TableCell key={category + team._id.toString()} align="center">
                    <Stack direction="row" alignItems="center" justifyContent="center">
                      <Typography>{team.number}</Typography>
                    </Stack>
                  </TableCell>
                ) : (
                  <TableCell sx={{ background: '#e0e0e0' }} />
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CoreAwardsDeliberationGrid;
