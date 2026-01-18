'use client';

import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { EnrichedTeam } from '../../types';

interface AwardWinnerCardProps {
  winner: EnrichedTeam;
  index: number;
}

export const AwardWinnerCard: React.FC<AwardWinnerCardProps> = ({ winner, index }) => {
  const t = useTranslations('pages.deliberations.final.review');
  const winnerInfo = `${winner.number} | ${winner.name}`;
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1,
        bgcolor: '#f5f5f5',
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 1
      }}
    >
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
        {t('place', { place: index + 1 })}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          color: 'text.primary',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {winnerInfo}
      </Typography>
    </Box>
  );
};
