'use client';

import { Box, Paper, Stack, Typography } from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';
import { useAwardTranslations } from '@lems/localization';
import { EnrichedTeam } from '../../types';
import { AwardWinnerCard } from './award-winner-card';

interface AwardSectionProps {
  awardName: string;
  winners: EnrichedTeam[];
}

export const AwardSection: React.FC<AwardSectionProps> = ({ awardName, winners }) => {
  const { getName } = useAwardTranslations();
  return (
    <Paper
      variant="outlined"
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
          {getName(awardName)}
        </Typography>
      </Box>

      <Stack spacing={1}>
        {winners.map((winner, index) => (
          <AwardWinnerCard key={winner.id} winner={winner} index={index} />
        ))}
      </Stack>
    </Paper>
  );
};
