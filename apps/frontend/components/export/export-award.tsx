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
  const backgroundFilename = award.isParticipation ? 'PARTICIPATION_AWARD_BG' : 'AWARD_BG';

  return (
    <Box width="100vw" height="100vh">
      <Box width="100%" height="100%" display="flex">
        <Box width="31%" position="relative">
          <Image
            alt=""
            src={`/assets/awards/${backgroundFilename}.svg`}
            fill
            style={{
              objectFit: 'contain'
            }}
          />
        </Box>
        <Box width="3px" height="100%" bgcolor="#000" />
        <Box width="70%" height="100%">
          <ExportAwardContent division={division} team={team} award={award} />
        </Box>
      </Box>
    </Box>
  );
};

export default ExportAward;
