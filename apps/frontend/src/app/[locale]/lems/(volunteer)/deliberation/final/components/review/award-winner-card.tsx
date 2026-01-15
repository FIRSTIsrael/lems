'use client';

import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

interface AwardWinnerCardProps {
  award: {
    id: string;
    place: number;
    type: string;
    showPlaces: boolean;
    winner?: {
      team?: {
        id: string;
        name: string;
        number: string;
      };
      name?: string;
    };
  };
}

export const AwardWinnerCard: React.FC<AwardWinnerCardProps> = ({ award }) => {
  const t = useTranslations('pages.deliberations.final.review');
  const winnerInfo = award.winner?.team
    ? `${award.winner.team.number} | ${award.winner.team.name}`
    : award.winner?.name || '-';

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
        {award.showPlaces ? t('place', { place: award.place }) : `#${award.place}`}
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
