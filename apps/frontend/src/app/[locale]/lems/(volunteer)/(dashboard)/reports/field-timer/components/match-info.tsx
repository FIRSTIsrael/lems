import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMatchTranslations } from '@lems/localization';
import type { Match } from '../graphql/types';

interface MatchInfoProps {
  match: Match;
  isDesktop: boolean;
}

export function MatchInfo({ match, isDesktop }: MatchInfoProps) {
  const t = useTranslations('pages.reports.field-timer');
  const { getStage } = useMatchTranslations();

  const getMatchLabel = () => {
    if (match.stage === 'TEST') {
      return t('test-match');
    }

    const stageName = getStage(match.stage);
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
    </Box>
  );
}
