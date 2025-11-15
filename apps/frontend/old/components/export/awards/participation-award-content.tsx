import { DivisionWithEvent, Team } from '@lems/types';
import { WithId } from 'mongodb';
import { Typography, Stack } from '@mui/material';

interface ExportParticipationAwardContentProps {
  division: WithId<DivisionWithEvent>;
  team: WithId<Team>;
}

const ExportParticipationAwardContent: React.FC<ExportParticipationAwardContentProps> = ({
  team
}) => {
  return (
    <Stack position="absolute" right={50} bottom={40} alignItems="center" justifyContent="center">
      <Typography variant="h2" fontSize="5rem" mt={2} align="center" color="#1d2848">
        {`קבוצה`}
      </Typography>
      <Typography variant="h2" fontSize="5rem" mb={0.5} align="center" color="#1d2848">
        {` #${team.number}`}
      </Typography>
    </Stack>
  );
};

export default ExportParticipationAwardContent;
