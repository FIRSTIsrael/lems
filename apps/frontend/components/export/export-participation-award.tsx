import { DivisionWithEvent, Team } from '@lems/types';
import { WithId } from 'mongodb';
import Image from 'next/image';
import { Box } from '@mui/material';
import ExportParticipationAwardContent from './awards/participation-award-content';

interface ExportParticipationAwardProps {
  division: WithId<DivisionWithEvent>;
  team: WithId<Team>;
}

const ExportParticipationAward: React.FC<ExportParticipationAwardProps> = ({ division, team }) => {
  return (
    <>
      <Box width="100vw" height="100vh">
        <Image
          alt=""
          src={`/assets/awards/PARTICIPATION_AWARD_BG.webp`}
          fill
          style={{
            objectFit: 'contain'
          }}
        />
      </Box>
      <ExportParticipationAwardContent division={division} team={team} />
    </>
  );
};

export default ExportParticipationAward;
