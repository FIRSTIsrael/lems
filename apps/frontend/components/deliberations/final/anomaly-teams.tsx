import { WithId } from 'mongodb';
import {
  ButtonProps,
  Paper,
  Typography,
  Stack,
  Divider,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  Box
} from '@mui/material';
import { DeliberationAnomaly } from '@lems/types';
import AnomalyIcon from './anomaly-icon';
import { groupBy } from '@lems/utils/objects';
import { DeliberationTeam } from '../../../hooks/use-deliberation-teams';

interface AnomalyTeamsProps extends ButtonProps {
  teams: Array<DeliberationTeam>;
  anomalies: Array<DeliberationAnomaly>;
}

const AnomalyTeams: React.FC<AnomalyTeamsProps> = ({ teams, anomalies }) => {
  const groupedAnomaliesWithTeams = groupBy(
    anomalies
      .map(anomaly => ({ ...anomaly, team: teams.find(t => t._id === anomaly.teamId)! }))
      .sort((a, b) => a.team.totalRank - b.team.totalRank),
    anomaly => anomaly.teamId.toString()
  );

  return (
    <Stack component={Paper} spacing={2} p={2} sx={{ height: '100%' }}>
      <Typography align="center" fontWeight={500}>
        קבוצות חריגות
      </Typography>

      <TableContainer sx={{ maxHeight: 425 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center" component="th" scope="row">
                קבוצה
              </TableCell>
              <TableCell align="center">דירוג</TableCell>
              <TableCell align="center">חריגה</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.values(groupedAnomaliesWithTeams).map(anomalies => {
              return (
                <TableRow key={anomalies[0].teamId.toString()}>
                  <TableCell align="center">{anomalies[0].team.number}</TableCell>
                  <TableCell align="center">
                    {Number(anomalies[0].team.totalRank.toFixed(2))}
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" justifyContent="center" alignItems="center">
                      <Stack direction="row" flexWrap="wrap">
                        {anomalies.map((anomaly, index) => (
                          <AnomalyIcon key={index} anomaly={anomaly} />
                        ))}
                      </Stack>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

export default AnomalyTeams;
