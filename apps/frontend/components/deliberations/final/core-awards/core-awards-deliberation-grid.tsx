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
  MANDATORY_AWARD_PICKLIST_LENGTH,
  DeliberationAnomaly,
  Rubric
} from '@lems/types';
import { localizedJudgingCategory } from '@lems/season';
import AnomalyIcon from '../anomaly-icon';

interface CoreAwardsDeliberationGridProps {
  teams: Array<WithId<Team>>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
  rooms: Array<WithId<JudgingRoom>>;
  sessions: Array<WithId<JudgingSession>>;
  cvForms: Array<WithId<CoreValuesForm>>;
  scoresheets: Array<WithId<Scoresheet>>;
  categoryPicklists: { [key in JudgingCategory]: Array<ObjectId> };
  disabled?: boolean;
  anomalies: Array<DeliberationAnomaly>;
}

const CoreAwardsDeliberationGrid: React.FC<CoreAwardsDeliberationGridProps> = ({
  teams,
  rubrics,
  rooms,
  sessions,
  cvForms,
  scoresheets,
  categoryPicklists,
  disabled = false,
  anomalies
}) => {
  const tableLength = MANDATORY_AWARD_PICKLIST_LENGTH;
  Object.entries(categoryPicklists).forEach(([category, picklist]) => {
    categoryPicklists[category as JudgingCategory] = picklist.filter(teamId =>
      teams.find(t => t._id === teamId)
    );
  });

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
                const rubric = rubrics.find(
                  rubric => rubric.category === category && rubric.teamId === teamId
                );
                const rubricValues = rubric?.data?.values || {};
                let score = Object.values(rubricValues).reduce(
                  (acc, current) => acc + current.value,
                  0
                );
                if (category === 'core-values') {
                  scoresheets
                    .filter(
                      scoresheet => scoresheet.teamId === teamId && scoresheet.stage === 'ranking'
                    )
                    .forEach(scoresheet => (score += scoresheet.data?.gp?.value || 3));
                }

                return !!team ? (
                  <TableCell key={category + team._id.toString()} align="center">
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                      <Typography>{team.number}</Typography>
                      <Typography fontSize="0.8rem">({score})</Typography>
                      <Stack direction="row">
                        {anomalies
                          .filter(a => a.teamId === teamId && a.category === category)
                          .map(a => (
                            <AnomalyIcon anomaly={a} redirect={false} />
                          ))}
                      </Stack>
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
