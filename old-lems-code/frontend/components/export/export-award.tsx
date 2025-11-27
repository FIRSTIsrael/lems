import { DivisionWithEvent, Team } from '@lems/types';
import { WithId } from 'mongodb';
import Image from 'next/image';
import { Box } from '@mui/material';
import ExportAwardContent from './awards/award-content';

export interface AwardToExport {
  name?: string;
  place?: number;
  isParticipation?: boolean;
}

interface ExportAwardProps {
  division: WithId<DivisionWithEvent>;
  team: WithId<Team>;
  award: AwardToExport;
}

const ExportAward: React.FC<ExportAwardProps> = ({ division, team, award }) => {
  const backgroundFilename = award.isParticipation ? 'PARTICIPATION_AWARD_BG.svg' : 'AWARD_BG.webp';

  return (
    <Box position="relative" width="100vw" height="100vh">
      <Image
        alt=""
        src={`/assets/awards/${backgroundFilename}`}
        fill
        style={{
          objectFit: 'contain'
        }}
      />
      <Box
        position="absolute"
        left={70}
        top={0}
        height="100%"
        display="flex"
        alignItems="center"
        pr={4}
      >
        <ExportAwardContent division={division} team={team} award={award} />
      </Box>
    </Box>
  );
};

export default ExportAward;
