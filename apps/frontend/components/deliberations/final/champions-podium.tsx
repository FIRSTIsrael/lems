import { ObjectId, WithId } from 'mongodb';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { Team } from '@lems/types';
import TeamSelection from '../../general/team-selection';

interface ChampionsPodiumProps {
  teams: Array<WithId<Team>>;
  award: Array<ObjectId | null>;
  setAward: (newTeams: Array<ObjectId | null>) => void;
}

const colors = [
  'radial-gradient(ellipse farthest-corner at right bottom, #FEDB37 0%, #FDB931 8%, #9f7928 30%, #8A6E2F 40%, transparent 80%), radial-gradient(ellipse farthest-corner at left top, #FFFFFF 0%, #FFFFAC 8%, #D1B464 25%, #5d4a1f 62.5%, #5d4a1f 100%)',
  'radial-gradient(at right bottom, rgb(192 192 188) 0%, rgb(132 131 130) 8%, rgb(108 108 106) 30%, rgb(73 73 71) 40%, transparent 80%), radial-gradient(at left top, rgb(255, 255, 255) 0%, rgb(220 220 218) 8%, rgb(204 203 201) 25%, rgb(162 159 154) 62.5%, rgb(80 79 75) 100%)',
  'radial-gradient(at right bottom, rgb(254 193 55) 0%, rgb(253 153 49) 8%, rgb(159 78 40) 30%, rgb(138 69 47) 40%, transparent 80%), radial-gradient(at left top, rgb(255, 255, 255) 0%, rgb(255 227 172) 8%, rgb(209 145 100) 25%, rgb(93 65 31) 62.5%, rgb(93 69 31) 100%)',
  '#5cbbfa'
];

const ChampionsPodium: React.FC<ChampionsPodiumProps> = ({ teams, award, setAward }) => {
  if (award.length > 4) {
    console.warn('Impossible award length detected. Edit AwardLimits.');
  }

  return (
    <Stack component={Paper} height="100%" direction="row" justifyContent="center" alignItems="end">
      {award.map((teamId, index) => {
        return (
          <Stack>
            <TeamSelection
              teams={teams.filter(t => !award.includes(t._id))}
              value={teamId ? teams.find(t => t._id === teamId)! : null}
              setTeam={newTeam => {
                const result = structuredClone(award);
                result[index] = newTeam ? newTeam._id : null;
                setAward(result);
              }}
            />
            <div
              key={index}
              style={{ background: colors[index], width: 150, height: 40 + 75 / (index / 3 + 1) }}
            />
          </Stack>
        );
      })}
    </Stack>
  );
};

export default ChampionsPodium;
