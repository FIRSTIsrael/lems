import { Typography, Paper } from '@mui/material';
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
    <Paper
      elevation={0}
      sx={{
        px: isDesktop ? 6 : 4,
        py: isDesktop ? 3 : 2,
        textAlign: 'center',
        background: theme => `${theme.palette.background.paper}E6`,
        border: theme => `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        backdropFilter: 'blur(4px)'
      }}
    >
      <Typography
        variant={isDesktop ? 'h3' : 'h5'}
        fontWeight={700}
        sx={{
          color: theme => theme.palette.text.primary,
          letterSpacing: '0.5px'
        }}
      >
        {getMatchLabel()}
      </Typography>
    </Paper>
  );
}
