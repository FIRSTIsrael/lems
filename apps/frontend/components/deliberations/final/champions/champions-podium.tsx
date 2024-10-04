import { ObjectId, WithId } from 'mongodb';
import { Box, Paper } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { Team, AwardLimits } from '@lems/types';
import TeamSelection from '../../../general/team-selection';

interface ChampionsPodiumProps {
  teams: Array<WithId<Team>>;
  award: Array<ObjectId | null>;
  setAward: (newTeams: Array<ObjectId | null>) => void;
  disabled?: boolean;
}

const colors = ['#fecb4d', '#788991', '#a97d4f', '#5ebad9'];

const ChampionsPodium: React.FC<ChampionsPodiumProps> = ({
  teams,
  award,
  setAward,
  disabled = false
}) => {
  if (award.length > AwardLimits['champions']!) {
    console.warn('Impossible award length detected. Edit AwardLimits.');
  }

  // This organizes the display like a classic podium
  const organizePodium = (index: number) => {
    if (index === 1) return award.length;
    if (index === 0) return award.length - 1;
    return award.length - index;
  };

  return (
    <Grid
      container
      component={Paper}
      height="100%"
      justifyContent="center"
      alignItems="end"
      columnGap={1}
    >
      {award.map((teamId, index) => {
        return (
          <Grid
            xs={2.5}
            order={organizePodium(index)}
            key={index}
            display="flex"
            alignItems="center"
            flexDirection="column"
          >
            <TeamSelection
              teams={teams.filter(t => !award.includes(t._id))}
              value={teamId ? teams.find(t => t._id === teamId)! : null}
              setTeam={newTeam => {
                const result = structuredClone(award);
                result[index] = newTeam ? newTeam._id : null;
                setAward(result);
              }}
              numberOnly={true}
              sx={{ width: 180 }}
              variant="standard"
              readOnly={disabled}
            />
            <Box
              borderRadius="8px 8px 0 0"
              bgcolor={colors[index]}
              width={180}
              height={40 + 50 * (award.length - index - 1)}
              mt={1}
            />
          </Grid>
        );
      })}
    </Grid>
  );
};

export default ChampionsPodium;
