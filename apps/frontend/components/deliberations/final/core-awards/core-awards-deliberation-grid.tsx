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
import { getBackgroundColor } from '../../../../lib/utils/theme';

interface CoreAwardsDeliberationGridProps {
  categoryRanks: { [key in JudgingCategory]: Array<ObjectId> };
  teams: Array<DeliberationTeam>;
  anomalies: Array<DeliberationAnomaly>;
  selectedTeams: Array<ObjectId>;
  additionalTeams: Array<ObjectId>;
}

const CoreAwardsDeliberationGrid: React.FC<CoreAwardsDeliberationGridProps> = ({
  categoryRanks,
  teams,
  anomalies,
  selectedTeams,
  additionalTeams
}) => {
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

  const tableLength = Math.max(...Object.values(categoryPicklists).map(list => list.length));

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
                <Typography>{i + 1}</Typography>
              </TableCell>
              {JudgingCategoryTypes.map(category => {
                const team = categoryPicklists[category][i];

                return !!team ? (
                  <TableCell
                    key={category + team._id.toString()}
                    align="center"
                    sx={
                      selectedTeams.includes(team._id)
                        ? { background: getBackgroundColor('#32a84c', 'light') }
                        : {}
                    }
                  >
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                      <Typography>{team.number}</Typography>
                      <Typography fontSize="0.8rem">({team.scores[category]})</Typography>
                      {anomalies
                        .filter(a => a.teamId === team._id && a.category === category)
                        .map((a, index) => (
                          <AnomalyIcon anomaly={a} key={index} />
                        ))}
                    </Stack>
                  </TableCell>
                ) : (
                  <TableCell sx={{ background: '#e0e0e0' }} />
                );
              })}
            </TableRow>
          ))}

          {additionalTeams.length > 0 && (
            <>
              <TableRow>
                <TableCell colSpan={4} sx={{ backgroundColor: '#666', height: 3, p: 0 }} />
              </TableRow>
              {additionalTeams.map((teamId, index) => {
                const team = teams.find(t => t._id === teamId)!;
                return (
                  <TableRow key={'added-' + index}>
                    <TableCell>
                      <Typography align="center">{team.number}</Typography>
                    </TableCell>
                    {JudgingCategoryTypes.map(category => (
                      <TableCell key={'addedscore-' + category}>
                        <Stack direction="row" justifyContent="center" spacing={1}>
                          <Typography>{team.scores[category]}</Typography>
                          {anomalies
                            .filter(a => a.teamId === team._id && a.category === category)
                            .map((a, index) => (
                              <AnomalyIcon anomaly={a} key={index} />
                            ))}
                        </Stack>
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CoreAwardsDeliberationGrid;
