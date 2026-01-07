'use client';

import { useTranslations } from 'next-intl';
import { Paper, Typography, Stack, Chip, useTheme, Box } from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';
import { useMatchTranslations } from '@lems/localization';
import { Match } from '../graphql';
import { useMc } from './mc-context';

export const CurrentMatchHero: React.FC = () => {
  const { loadedMatch, matches } = useMc();
  const t = useTranslations('pages.mc.current-match');
  const { getStage } = useMatchTranslations();
  const theme = useTheme();

  const match = matches.find(m => m.id === loadedMatch);

  if (!match) {
    return (
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          bgcolor: 'background.paper',
          border: '2px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="h6" color="textSecondary">
          {t('no-match')}
        </Typography>
      </Paper>
    );
  }

  const getStatusColor = (status: Match['status']) => {
    switch (status) {
      case 'in-progress':
        return 'success';
      case 'not-started':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: Match['status']) => {
    switch (status) {
      case 'in-progress':
        return t('status.in-progress');
      case 'not-started':
        return t('status.loaded');
      default:
        return '';
    }
  };

  return (
    <Paper
      sx={{
        p: 4,
        background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.dark}10 100%)`,
        border: '2px solid',
        borderColor: theme.palette.primary.main,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          opacity: 0.05,
          transform: 'rotate(-15deg)'
        }}
      >
        <EmojiEvents sx={{ fontSize: 200 }} />
      </Box>

      <Stack spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            {t('match-title', {
              stage: getStage(match.stage),
              round: match.round,
              number: match.number
            })}
          </Typography>
          <Chip
            label={getStatusLabel(match.status)}
            color={getStatusColor(match.status)}
            sx={{ fontWeight: 600, fontSize: '0.9rem', px: 1 }}
          />
        </Stack>

        <Stack spacing={2} direction={{ xs: 'column', md: 'row' }}>
          {match.participants.map(participant => (
            <Box key={participant.id} sx={{ flex: { xs: '1', md: '1 1 50%' } }}>
              <Paper
                sx={{
                  p: 2.5,
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'divider',
                  opacity: participant.team ? 1 : 0.6,
                  backgroundColor: !participant.team
                    ? 'action.disabledBackground'
                    : 'background.paper'
                }}
              >
                <Stack spacing={1.5}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    justifyContent="space-between"
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.primary.main
                      }}
                    >
                      {participant.team
                        ? `${participant.team.name} #${participant.team.number}`
                        : '-'}
                    </Typography>
                    <Chip
                      label={`${t('table')} ${participant.table.name}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </Stack>

                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {participant.team
                      ? `${participant.team.affiliation}, ${participant.team.city}`
                      : t('no-team')}
                  </Typography>

                  {participant.team && !participant.team.arrived && (
                    <Chip
                      label={t('not-arrived')}
                      size="small"
                      color="warning"
                      sx={{ alignSelf: 'flex-start', mt: 0.5 }}
                    />
                  )}
                </Stack>
              </Paper>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
};
