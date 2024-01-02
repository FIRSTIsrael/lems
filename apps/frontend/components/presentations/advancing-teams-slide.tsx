import { WithId } from 'mongodb';
import { Box, Stack, Typography } from '@mui/material';
import { Appear, Slide } from '@lems/presentations';
import { DivisionColor, Team } from '@lems/types';
import { getDivisionColor } from '../../lib/utils/colors';
import LogoStack from './logo-stack';
import { localizeTeam } from '../../localization/teams';

interface AdvancingTeamsSlideProps {
  teams: Array<WithId<Team>>;
  color?: DivisionColor;
}

const AdvancingTeamsSlide: React.FC<AdvancingTeamsSlideProps> = ({ teams, color }) => {
  return (
    <Slide>
      <Stack px={20} textAlign="center">
        <Typography variant="h1" fontSize="6rem" gutterBottom>
          קבוצות המעפילות שלב
        </Typography>
        <Box
          sx={{
            background: '#f7f8f9',
            maxWidth: 'lg',
            px: 8,
            py: 6,
            borderRadius: 4,
            boxShadow: color && `-10px 10px 12px ${getDivisionColor(color)}74`
          }}
        >
          {teams.map(team => (
            <Appear key={team._id.toString()}>
              <Typography fontSize="4rem" fontWeight={700}>
                {localizeTeam(team)}
              </Typography>
            </Appear>
          ))}
        </Box>
        <LogoStack />
      </Stack>
    </Slide>
  );
};

export default AdvancingTeamsSlide;
