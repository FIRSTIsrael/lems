import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { PortalScore } from '@lems/types';
import { localizedMatchStage } from '../../lib/localization';

interface TeamRobotScoresProps {
  score: PortalScore;
  currentStage: 'practice' | 'ranking';
}

const TeamRobotScores: React.FC<TeamRobotScoresProps> = ({ score, currentStage }) => {
  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h2">ביצועי הרובוט</Typography>
      <Typography color="text.secondary" gutterBottom>
        מקצי {localizedMatchStage[currentStage]}
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography fontWeight={500}>מקצה</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={500}>ניקוד</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {score.scores.map((score, index) => (
              <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>מקצה #{index + 1}</TableCell>
                <TableCell>{score ?? '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default TeamRobotScores;
