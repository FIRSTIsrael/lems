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
import { DeliberationAnomaly, Team } from '@lems/types';
import AnomalyIcon from './anomaly-icon';

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
  const anomaliesWithTeams = anomalies
    .map(anomaly => ({ ...anomaly, team: teams.find(t => t._id === anomaly.teamId)! }))
    .sort((a, b) => a.team.totalRank - b.team.totalRank);

  return (
    <Stack component={Paper} spacing={2} p={2} sx={{ height: '100%' }}>
      <Typography align="center" fontWeight={500}>
        קבוצות חריגות
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>קבוצה</TableCell>
              <TableCell>דירוג</TableCell>
              <TableCell>חריגה</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {anomaliesWithTeams.map(anomaly => {
              return (
                <TableRow>
                  <TableCell>{anomaly.team.number}</TableCell>
                  <TableCell>{anomaly.team.totalRank}</TableCell>
                  <TableCell>
                    <AnomalyIcon anomaly={anomaly} />
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
