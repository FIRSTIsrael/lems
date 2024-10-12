import { ObjectId } from 'mongodb';
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
  JudgingCategoryTypes,
  JudgingCategory,
  PRELIMINARY_DELIBERATION_PICKLIST_LENGTH,
  DeliberationAnomaly
} from '@lems/types';
import { localizedJudgingCategory } from '@lems/season';
import AnomalyIcon from '../anomaly-icon';
import { DeliberationTeam } from '../../../../hooks/use-deliberation-teams';
import { WithId } from 'mongodb';

interface CoreAwardsDeliberationGridProps {
  categoryRanks: { [key in JudgingCategory]: Array<ObjectId> };
  teams: Array<DeliberationTeam>;
  anomalies: Array<DeliberationAnomaly>;
}

const CoreAwardsDeliberationGrid: React.FC<CoreAwardsDeliberationGridProps> = ({
  categoryRanks,
  teams,
  anomalies
}) => {
  const tableLength = PRELIMINARY_DELIBERATION_PICKLIST_LENGTH;

  const categoryPicklists: Record<
    JudgingCategory,
    Array<DeliberationTeam>
  > = JudgingCategoryTypes.reduce(
    (acc, category) => ({
      ...acc,
      [category]: (categoryRanks[category] || [])
        .filter(teamId => teams.find(t => t._id === teamId))
        .map(teamId => teams.find(t => t._id === teamId))
    }),
    {} as Record<JudgingCategory, Array<DeliberationTeam>>
  );

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
                const team = categoryPicklists[category][i];

                return !!team ? (
                  <TableCell key={category + team._id.toString()} align="center">
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                      <Typography>{team.number}</Typography>
                      <Typography fontSize="0.8rem">({team.scores[category]})</Typography>
                      <Stack direction="row">
                        {anomalies
                          .filter(a => a.teamId === team._id && a.category === category)
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
