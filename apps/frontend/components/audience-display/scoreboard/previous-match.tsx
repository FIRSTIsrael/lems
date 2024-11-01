import { Stack, Typography, Grid2Props, Paper } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { yellow, grey, green } from '@mui/material/colors';
import { WithId } from 'mongodb';
import { Team, Scoresheet, RobotGameMatch } from '@lems/types';
import { localizedMatchStage } from '../../../localization/field';

interface TeamScoreBoxProps {
  team: WithId<Team>;
  scoresheet: WithId<Scoresheet>;
}

const TeamScoreBox: React.FC<TeamScoreBoxProps> = ({ team, scoresheet }) => {
  return (
    <Stack
      sx={{
        color: ['in-progress', 'waiting-for-head-ref'].includes(scoresheet.status)
          ? yellow[800]
          : scoresheet.status === 'empty'
            ? grey[800]
            : green[800],
        border: `1px solid ${
          ['in-progress', 'waiting-for-head-ref'].includes(scoresheet.status)
            ? yellow[300]
            : scoresheet.status === 'empty'
              ? grey[300]
              : green[300]
        }`,
        backgroundColor: ['in-progress', 'waiting-for-head-ref'].includes(scoresheet.status)
          ? yellow[100]
          : scoresheet.status === 'empty'
            ? grey[100]
            : green[100],
        borderRadius: '0.5rem',
        px: 1.5,
        py: 0.5
      }}
      direction="row"
      spacing={4}
      alignItems="center"
      justifyContent="center"
      height="100%"
    >
      <Typography fontSize="2rem">#{team.number}</Typography>
      <Typography fontWeight={700} fontSize="2rem" color="textSecondary">
        {scoresheet.status === 'waiting-for-head-ref' ? 'בבדיקה' : scoresheet.data?.score || '-'}
      </Typography>
    </Stack>
  );
};

interface ScoreboardPreviousMatchProps extends Grid2Props {
  previousMatch: WithId<RobotGameMatch> | undefined;
  previousScoresheets: Array<WithId<Scoresheet>>;
}

const ScoreboardPreviousMatch: React.FC<ScoreboardPreviousMatchProps> = ({
  previousMatch,
  previousScoresheets,
  ...props
}) => {
  return (
    <Grid container component={Paper} {...props} alignItems="center">
      <Grid size={3}>
        <Typography component="h2" fontSize="1.75rem" fontWeight={500}>
          {previousMatch?.number
            ? `מקצה קודם (מקצה ${previousMatch && localizedMatchStage[previousMatch.stage]} #${previousMatch?.number})`
            : previousMatch?.stage === 'test'
              ? 'מקצה בדיקה'
              : 'מקצה קודם (-)'}
        </Typography>
        <Typography fontWeight={400} fontSize="1.5rem" color="textSecondary">
          הניקוד אינו סופי ויכול להשתנות בכל רגע.
        </Typography>
      </Grid>
      <Grid
        container
        columns={previousMatch?.participants.filter(p => p.teamId).length}
        alignContent="center"
        direction="row"
        height="100%"
        spacing={2}
        size={9}
      >
        {previousMatch?.participants
          .filter(p => p.teamId)
          .map(p => {
            const scoresheet = previousScoresheets.find(s => s.teamId === p.teamId);
            return (
              scoresheet && (
                <Grid key={scoresheet._id.toString()} height="100%" size={1}>
                  <TeamScoreBox
                    team={p.team || ({} as WithId<Team>)}
                    scoresheet={scoresheet || ({} as WithId<Scoresheet>)}
                  />
                </Grid>
              )
            );
          })}
      </Grid>
    </Grid>
  );
};

export default ScoreboardPreviousMatch;
