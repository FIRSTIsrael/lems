import { Scoresheet, Team, DivisionState } from '@lems/types';
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
import { compareScoreArrays } from '@lems/utils/arrays';

interface ScoreboardScoresProps {
  scoresheets: Array<WithId<Scoresheet>>;
  teams: Array<WithId<Team>>;
  divisionState: DivisionState;
}

const ScoreboardScores: React.FC<ScoreboardScoresProps> = ({
  scoresheets,
  teams,
  divisionState
}) => {
  const rounds = [
    ...scoresheets
      .filter(s => s.stage === divisionState.currentStage)
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
      const scores = [
        ...scoresheets
          .filter(
            s =>
              s.teamId === t._id && s.stage === divisionState.currentStage && s.status === 'ready'
          )
          .map(s => s.data?.score || 0)
      ];
      return {
        team: t,
        scores: scores,
        score: Math.max(...scores, 0)
      };
    })
    .sort((a, b) => compareScoreArrays(a.scores, b.scores));

  const marquee = keyframes`
    from {transform: translateY(0)}
    to {transform: translateY(-100%)}
  `;
  const marqueeAnimation = `${marquee} 45s linear infinite`;

  return (
    <TableContainer
      component={Paper}
      sx={{
        fontSize: '1.75rem',
        fontWeight: 700,
        height: '100%',
        mt: 4,
        overflow: 'hidden'
      }}
    >
      <Table
        stickyHeader
        sx={{
          '.MuiTableRow-root:nth-child(odd)': { backgroundColor: '#f9f9f9' }
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ font: 'inherit', textAlign: 'center' }}>דירוג</TableCell>
            <TableCell sx={{ font: 'inherit' }}>קבוצה</TableCell>
            {rounds.map(r => (
              <TableCell key={r.stage + r.round + 'name'} align="center" sx={{ font: 'inherit' }}>
                סבב {localizedMatchStage[r.stage]} #{r.round}
              </TableCell>
            ))}
            {divisionState.currentStage !== 'practice' && (
              <TableCell align="center" sx={{ font: 'inherit' }}>
                ניקוד גבוה ביותר
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <ScoreboardScoresBody
          scoresheets={scoresheets}
          rounds={rounds}
          currentStage={divisionState.currentStage}
          maxScores={maxScores}
          sx={{ animation: marqueeAnimation }}
        />
        <ScoreboardScoresBody
          scoresheets={scoresheets}
          rounds={rounds}
          currentStage={divisionState.currentStage}
          maxScores={maxScores}
          sx={{ animation: marqueeAnimation }}
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
      {maxScores.map(({ team, score: maxScore }, index) => {
        return (
          <TableRow key={team._id.toString()}>
            <TableCell sx={{ font: 'inherit', textAlign: 'center', fontWeight: 400 }}>
              {index + 1}
            </TableCell>
            <TableCell
              sx={{
                font: 'inherit',
                fontWeight: 500,
                color: !team.registered ? '#aaa' : undefined
              }}
            >
              {localizeTeam(team, false)}
            </TableCell>
            {rounds.map(r => {
              const scoresheet = scoresheets.find(
                s => s.teamId === team._id && s.stage === r.stage && s.round === r.round
              );
              return (
                <TableCell
                  key={r.stage + r.round + 'points'}
                  align="center"
                  sx={{ font: 'inherit', fontWeight: 400 }}
                >
                  {scoresheet?.data && scoresheet.status === 'ready' ? (
                    scoresheet.data.score
                  ) : (
                    <RemoveIcon />
                  )}
                </TableCell>
              );
            })}
            {currentStage !== 'practice' && (
              <TableCell align="center" sx={{ font: 'inherit' }}>
                {maxScore || <RemoveIcon />}
              </TableCell>
            )}
          </TableRow>
        );
      })}
      {/* Separator */}
      <TableRow sx={{ height: '4.5rem' }}>
        <TableCell colSpan={(currentStage === 'practice' ? 2 : 3) + rounds.length} />
      </TableRow>
    </TableBody>
  );
};

export default ScoreboardScores;
