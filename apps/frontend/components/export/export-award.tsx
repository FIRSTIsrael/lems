import { DivisionWithEvent, Team } from '@lems/types';
import { WithId } from 'mongodb';
import Image from 'next/image';
import { Box } from '@mui/material';
import ExportAwardContent from './awards/award-content';

interface ExportAwardProps {
  division: WithId<DivisionWithEvent>;
  team: WithId<Team>;
}

const ExportAward: React.FC<ExportAwardProps> = ({ division, team }) => {
  return (
    <Box
      width="100vw"
      height="100vh"
      sx={{
        '@media print': {
          page: {
            size: 'A4',
            margin: 0
          }
        }
      }}
    >
      <Box width="100%" height="100%" display="flex">
        <Box width="31%" position="relative">
          <Image
            alt=""
            src="/assets/awards/PARTICIPATION_AWARD_BG.svg"
            fill
            style={{
              objectFit: 'contain'
            }}
          />
        </Box>
        <Box width="3px" height="100%" bgcolor="#000" />
        <Box width="70%" height="100%">
          <ExportAwardContent />
        </Box>
      </Box>
    </Box>
  );
};

export default ExportAward;
