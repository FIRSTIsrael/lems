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
      <Stack px={20} height="calc(100% - 100px)">
        <Typography variant="h1" fontSize="6rem" textAlign="center" gutterBottom>
          קבוצות המעפילות שלב
        </Typography>
        <Box
          sx={{
            background: '#f7f8f9',
            maxWidth: 'lg',
            px: 8,
            py: 6,
            borderRadius: 4,
            boxShadow: color && `-20px 20px 24px ${getDivisionColor(color)}74`
          }}
        >
          {teams.map(team => (
            <Appear key={team._id.toString()}>
              <Typography fontSize="1.75rem" fontWeight={500}>
                {localizeTeam(team)}
              </Typography>
            </Appear>
          ))}
        </Box>
      </Stack>
      <LogoStack />
    </Slide>
  );
};

export default AdvancingTeamsSlide;
