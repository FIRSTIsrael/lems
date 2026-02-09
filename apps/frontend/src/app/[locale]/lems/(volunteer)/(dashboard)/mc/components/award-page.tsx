'use client';

import { useTranslations } from 'next-intl';
import { Stack, Paper, Typography, Box, useTheme, alpha } from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';
import { useAwardTranslations } from '@lems/localization';
import { Flag } from '@lems/shared';
import type { Award } from '../graphql/types';

interface AwardGroup {
  name: string;
  index: number;
  awards: Award[];
  showPlaces: boolean;
}

interface AwardPageProps {
  awardGroup: AwardGroup;
}

export const AwardPage: React.FC<AwardPageProps> = ({ awardGroup }) => {
  const theme = useTheme();
  const t = useTranslations('pages.mc.awards');
  const { getName, getDescription } = useAwardTranslations();

  const getMedalColor = (place: number) => {
    switch (place) {
      case 1:
        return { bg: '#FFD700', text: '#B8860B' }; // Gold
      case 2:
        return { bg: '#C0C0C0', text: '#808080' }; // Silver
      case 3:
        return { bg: '#CD7F32', text: '#8B4513' }; // Bronze
      default:
        return { bg: theme.palette.primary.main, text: theme.palette.primary.contrastText };
    }
  };

  return (
    <Stack spacing={3} alignItems="center">
      <Stack
        direction="row"
        spacing={3}
        alignItems="center"
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          p: 3,
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          width: '100%'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <EmojiEvents sx={{ fontSize: 56, color: 'primary.main' }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.75rem', sm: '2.25rem' },
              color: 'primary.main'
            }}
          >
            {t('award', { awardName: getName(awardGroup.name) })}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.95rem' }}>
            {getDescription(awardGroup.name)}
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={2} sx={{ width: '100%' }}>
        {awardGroup.awards.map((award, index) => {
          const medalColor =
            awardGroup.showPlaces && award.place > 0 ? getMedalColor(award.place) : null;

          return (
            <Paper
              key={award.id}
              sx={{
                p: 3,
                bgcolor: 'background.paper',
                border: `1px solid ${theme.palette.divider}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  boxShadow: theme.shadows[8],
                  transform: 'translateY(-2px)',
                  borderColor: theme.palette.primary.light
                },
                animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
              }}
            >
              <Stack direction="row" spacing={3} alignItems="center" justifyContent="flex-start">
                {/* Place Badge */}
                {award.place > 0 && awardGroup.showPlaces && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '2rem',
                      color:
                        awardGroup.showPlaces && medalColor
                          ? medalColor.text
                          : theme.palette.primary.main,
                      flexShrink: 0,
                      minWidth: 48
                    }}
                  >
                    {award.place}
                  </Box>
                )}

                {/* Team Winner */}
                {award.winner && award.winner.__typename === 'TeamWinner' && (
                  <Stack
                    spacing={0.75}
                    sx={{
                      flex: 1,
                      minWidth: 0
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          fontSize: '1.35rem',
                          lineHeight: 1.2,
                          color: 'text.primary'
                        }}
                      >
                        {`${award.winner.team.name} #${award.winner.team.number}`}
                      </Typography>
                      {award.winner.team.region && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Flag region={award.winner.team.region} size={24} />
                        </Box>
                      )}
                    </Stack>
                    {award.winner.team.affiliation && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontSize: '0.9rem',
                          display: 'flex',
                          gap: 0.5,
                          alignItems: 'center'
                        }}
                      >
                        <Typography component="span" variant="body2" sx={{ fontWeight: 500 }}>
                          {award.winner.team.affiliation}
                        </Typography>
                        <Typography component="span" variant="body2">
                          •
                        </Typography>
                        <Typography component="span" variant="body2">
                          {award.winner.team.city}
                        </Typography>
                      </Typography>
                    )}
                  </Stack>
                )}

                {/* Personal Winner */}
                {award.winner && award.winner.__typename === 'PersonalWinner' && (
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      fontSize: '1.35rem',
                      color: 'text.primary'
                    }}
                  >
                    {award.winner.name}
                  </Typography>
                )}
              </Stack>
            </Paper>
          );
        })}
      </Stack>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Stack>
  );
};
