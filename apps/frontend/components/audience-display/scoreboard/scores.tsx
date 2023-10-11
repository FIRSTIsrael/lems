import { Scoresheet, Team, EventState } from '@lems/types';
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBodyProps,
  TableBody,
  keyframes
} from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import { WithId } from 'mongodb';
import { localizedMatchStage } from '../../../localization/field';

interface ScoreboardScoresProps {
  scoresheets: Array<WithId<Scoresheet>>;
  teams: Array<WithId<Team>>;
  eventState: EventState;
}

const ScoreboardScores: React.FC<ScoreboardScoresProps> = ({ scoresheets, teams, eventState }) => {
  const rounds = [
    ...scoresheets
      .filter(s => s.stage === eventState.currentStage)
      .map(s => {
        return { stage: s.stage, round: s.round };
      })
      .filter(
        (value, index, self) =>
          index === self.findIndex(r => r.round === value.round && r.stage === value.stage)
      )
  ];

  const maxScores = teams.map(t => {
    return {
      team: t,
      score: Math.max(
        ...scoresheets
          .filter(s => s.teamId === t._id && s.stage === 'ranking')
          .map(s => s.data?.score || 0)
      )
    };
  });

  const marquee = keyframes`
  from {transform: translateY(0)}
  to {transform: translateY(-100%)}
  `;

  return (
    <TableContainer
      component={Paper}
      sx={{
        height: '100%',
        mt: 4,
        overflow: 'hidden'
      }}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontSize: '1.5rem', fontWeight: 700 }}>מספר קבוצה</TableCell>
            <TableCell sx={{ fontSize: '1.5rem', fontWeight: 700 }}>שם קבוצה</TableCell>
            {eventState.currentStage !== 'practice' && (
              <TableCell align="center" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
                ניקוד גבוה ביותר
              </TableCell>
            )}
            {rounds.map(r => (
              <TableCell
                key={r.stage + r.round + 'name'}
                align="center"
                sx={{ fontSize: '1.5rem', fontWeight: 700 }}
              >
                {localizedMatchStage[r.stage]} #{r.round}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <ScoreboardScoresBody
          scoresheets={scoresheets}
          teams={teams}
          rounds={rounds}
          currentStage={eventState.currentStage}
          maxScores={maxScores}
          sx={{ animation: `${marquee} 30s linear infinite` }}
        />
        <ScoreboardScoresBody
          scoresheets={scoresheets}
          teams={teams}
          rounds={rounds}
          currentStage={eventState.currentStage}
          maxScores={maxScores}
          sx={{ animation: `${marquee} 30s linear infinite` }}
        />
      </Table>
    </TableContainer>
  );
};

interface ScoreboardScoresBodyProps extends TableBodyProps {
  scoresheets: Array<WithId<Scoresheet>>;
  teams: Array<WithId<Team>>;
  rounds: Array<{ stage: string; round: number }>;
  currentStage: 'practice' | 'ranking';
  maxScores: Array<{ team: WithId<Team>; score: number }>;
}

const ScoreboardScoresBody: React.FC<ScoreboardScoresBodyProps> = ({
  scoresheets,
  teams,
  rounds,
  currentStage,
  maxScores,
  ...props
}) => {
  return (
    <TableBody {...props}>
      {teams.map(t => (
        <TableRow key={t._id.toString()}>
          <TableCell sx={{ fontSize: '1.125rem', fontWeight: 700 }}>{t.number}</TableCell>
          <TableCell sx={{ fontSize: '1.125rem', fontWeight: 700 }}>{t.name}</TableCell>
          {currentStage !== 'practice' && (
            <TableCell align="center" sx={{ fontSize: '1.125rem', fontWeight: 700 }}>
              {maxScores.find(ms => ms.team._id === t._id)?.score || <RemoveIcon />}
            </TableCell>
          )}
          {rounds.map(r => {
            const scoresheet = scoresheets.find(
              s => s.teamId === t._id && s.stage === r.stage && s.round === r.round
            );
            return (
              <TableCell
                key={r.stage + r.round + 'points'}
                align="center"
                sx={{ fontSize: '1.125rem', fontWeight: 700 }}
              >
                {scoresheet?.data && scoresheet.status === 'ready' ? (
                  scoresheet.data.score
                ) : (
                  <RemoveIcon />
                )}
              </TableCell>
            );
          })}
        </TableRow>
      ))}
    </TableBody>
  );
};

export default ScoreboardScores;
