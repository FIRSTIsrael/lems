'use client';

import { Box, Paper, Stack, Typography } from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';
import { AwardWinnerCard } from './award-winner-card';

interface AwardSectionProps {
  awardName: string;
  awards: Array<{
    id: string;
    name: string;
    place: number;
    type: string;
    winner?: {
      team?: {
        id: string;
        name: string;
        number: string;
      };
      name?: string;
    };
  }>;
  getAwardName: (awardId: string) => string;
}

export const AwardSection: React.FC<AwardSectionProps> = ({ awardName, awards, getAwardName }) => {
  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 1.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        width: '100%',
        height: '100%'
      }}
    >
      {/* Award Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <EmojiEvents sx={{ color: 'primary.main', fontSize: '1.5rem' }} />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: '1.125rem',
            color: 'text.primary'
          }}
        >
          {getAwardName(awardName)}
        </Typography>
      </Box>

      {/* Award Winners */}
      <Stack spacing={1}>
        {awards.map(award => (
          <AwardWinnerCard key={award.id} award={award} />
        ))}
      </Stack>
    </Paper>
  );
};
