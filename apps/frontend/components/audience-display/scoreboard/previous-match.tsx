import { Stack, Typography, Grid2Props, Paper } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { yellow, grey, green } from '@mui/material/colors';
import { WithId } from 'mongodb';
import { Team, Scoresheet, RobotGameMatch } from '@lems/types';

interface TeamScoreBoxProps {
  team: WithId<Team>;
  scoresheet: WithId<Scoresheet>;
}

const TeamScoreBox: React.FC<TeamScoreBoxProps> = ({ team, scoresheet }) => {
  return (
    <Stack
      sx={{
        color:
          scoresheet.status === 'in-progress'
            ? yellow[800]
            : scoresheet.status === 'empty'
            ? grey[800]
            : green[800],
        border: `1px solid ${
          scoresheet.status === 'in-progress'
            ? yellow[300]
            : scoresheet.status === 'empty'
            ? grey[300]
            : green[300]
        }`,
        backgroundColor:
          scoresheet.status === 'in-progress'
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
      <Typography fontWeight={700} fontSize="2rem" color="text.secondary">
        {scoresheet.data?.score || '-'}
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
      <Grid xs={3}>
        <Typography fontWeight={700} fontSize="3rem">
          {previousMatch?.number
            ? `מקצה #${previousMatch?.number}`
            : previousMatch?.stage === 'test'
            ? 'מקצה בדיקה'
            : '-'}
        </Typography>
        <Typography fontWeight={400} fontSize="1.5rem" color="text.secondary">
          הניקוד אינו סופי ויכול להשתנות בכל רגע.
        </Typography>
      </Grid>
      <Grid
        container
        xs={9}
        columns={4}
        alignContent="center"
        direction="row"
        spacing={2}
        height="100%"
      >
        {previousMatch?.participants.map(p => {
          const scoresheet = previousScoresheets.find(s => s.teamId === p.teamId);
          return (
            scoresheet && (
              <Grid key={scoresheet._id.toString()} xs={1} height="100%">
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
