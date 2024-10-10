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
  TableHead
} from '@mui/material';
import { DeliberationAnomaly, JudgingCategory, Rubric, Team } from '@lems/types';
import AnomalyIcon from './anomaly-icon';
import { groupBy } from '@lems/utils/objects';

interface TeamWithRanks extends Team {
  cvRank: number;
  ipRank: number;
  rdRank: number;
  rgRank: number;
  totalRank: number;
}

interface AnomalyTeamsProps extends ButtonProps {
  teams: Array<WithId<TeamWithRanks>>;
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
                  <TableCell align="center">{anomalies[0].team.totalRank}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" flexWrap="wrap">
                      {anomalies.map((anomaly, index) => (
                        <AnomalyIcon key={index} anomaly={anomaly} />
                      ))}
                    </Stack>
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
