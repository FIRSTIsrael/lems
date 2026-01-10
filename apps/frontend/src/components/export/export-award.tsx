'use client';

import { Box } from '@mui/material';
import Image from 'next/image';

export interface AwardToExport {
  name?: string;
  place?: number;
  isParticipation?: boolean;
}

interface ExportAwardProps {
  teamNumber: number;
  teamName: string;
  award: AwardToExport;
}

const ExportAward: React.FC<ExportAwardProps> = ({ teamNumber, teamName, award }) => {
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
        <Box>
          <Box sx={{ fontSize: '2rem', fontWeight: 'bold', mb: 2 }}>{award.name}</Box>
          <Box sx={{ fontSize: '1.5rem', mb: 1 }}>{teamName}</Box>
          <Box sx={{ fontSize: '1.2rem' }}>Team #{teamNumber}</Box>
          {award.place && <Box sx={{ fontSize: '1rem', mt: 2 }}>Place: {award.place}</Box>}
        </Box>
      </Box>
    </Box>
  );
};

export default ExportAward;
