import { useTranslations } from 'next-intl';
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
import { useLocaleMatchStage } from '../../locale/hooks/use-locale-match-stage';

interface TeamRobotScoresProps {
  score: PortalScore;
  currentStage: 'practice' | 'ranking';
}

const TeamRobotScores: React.FC<TeamRobotScoresProps> = ({ score, currentStage }) => {
  const t = useTranslations('components:teams:team-scores');
  const matchStageToText = useLocaleMatchStage();

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h2">{t('title')}</Typography>
      <Typography color="text.secondary" gutterBottom>
        {t('subtitle', { stage: matchStageToText(currentStage) })}
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography fontWeight={500}>{t('columns.match')}</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={500}>{t('columns.score')}</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {score.scores.map((score, index) => (
              <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>{t('match-number', { number: index + 1 })}</TableCell>
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
