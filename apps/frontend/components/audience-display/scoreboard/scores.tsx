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
import { localizeTeam } from '../../../localization/teams';

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

  const maxScores = teams
    .map(t => {
      return {
        team: t,
        score: Math.max(
          ...scoresheets
            .filter(s => s.teamId === t._id && s.stage === 'ranking')
            .map(s => s.data?.score || 0)
        )
      };
    })
    .sort((a, b) => b.score - a.score);

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
            <TableCell sx={{ fontSize: '1.5rem', fontWeight: 700 }} />
            <TableCell sx={{ fontSize: '1.5rem', fontWeight: 700 }}>קבוצה</TableCell>
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
          rounds={rounds}
          currentStage={eventState.currentStage}
          maxScores={maxScores}
          sx={{ animation: `${marquee} 60s linear infinite` }}
        />
        <ScoreboardScoresBody
          scoresheets={scoresheets}
          rounds={rounds}
          currentStage={eventState.currentStage}
          maxScores={maxScores}
          sx={{ animation: `${marquee} 60s linear infinite` }}
        />
      </Table>
    </TableContainer>
  );
};

interface ScoreboardScoresBodyProps extends TableBodyProps {
  scoresheets: Array<WithId<Scoresheet>>;
  rounds: Array<{ stage: string; round: number }>;
  currentStage: 'practice' | 'ranking';
  maxScores: Array<{ team: WithId<Team>; score: number }>;
}

const ScoreboardScoresBody: React.FC<ScoreboardScoresBodyProps> = ({
  scoresheets,
  rounds,
  currentStage,
  maxScores,
  ...props
}) => {
  return (
    <TableBody {...props}>
      {maxScores.map(({ team, score }, index) => {
        return (
          <TableRow key={team._id.toString()}>
            <TableCell sx={{ fontSize: '1.125rem', fontWeight: 700 }}>{index + 1}</TableCell>
            <TableCell sx={{ fontSize: '1.125rem', fontWeight: 700 }}>
              {localizeTeam(team, false)}
            </TableCell>
            {currentStage !== 'practice' && (
              <TableCell align="center" sx={{ fontSize: '1.125rem', fontWeight: 700 }}>
                {score || <RemoveIcon />}
              </TableCell>
            )}
            {rounds.map(r => {
              const scoresheet = scoresheets.find(
                s => s.teamId === team._id && s.stage === r.stage && s.round === r.round
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
        );
      })}
    </TableBody>
  );
};

export default ScoreboardScores;
