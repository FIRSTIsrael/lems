import { Box, Typography, Chip } from '@mui/material';
import { useTranslations } from 'next-intl';
import type { Match } from '../graphql/types';

interface MatchInfoProps {
  match: Match;
  isDesktop: boolean;
}

export function MatchInfo({ match, isDesktop }: MatchInfoProps) {
  const t = useTranslations('pages.reports.field-timer');

  const getMatchLabel = () => {
    if (match.stage === 'TEST') {
      return t('test-match');
    }

    const stageName = t(`stages.${match.stage}`);
    return t('match-info', {
      stage: stageName,
      round: match.round,
      number: match.number
    });
  };

  return (
    <Box
      sx={{
        textAlign: 'center',
        mb: isDesktop ? 4 : 2
      }}
    >
      <Typography
        variant={isDesktop ? 'h2' : 'h4'}
        fontWeight={600}
        sx={{
          mb: 2,
          color: theme => theme.palette.text.primary
        }}
      >
        {getMatchLabel()}
      </Typography>
      <Chip
        label={match.slug}
        size={isDesktop ? 'medium' : 'small'}
        sx={{
          fontFamily: 'Roboto Mono',
          fontWeight: 600,
          fontSize: isDesktop ? '1.25rem' : '1rem',
          px: isDesktop ? 2 : 1,
          py: isDesktop ? 3 : 2
        }}
      />
    </Box>
  );
}
