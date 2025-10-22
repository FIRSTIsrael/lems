'use client';

import { useTranslations } from 'next-intl';
import { Typography, Paper, Box, Divider, Grid, Stack } from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';
import NextLink from 'next/link';

interface Team {
  id: string;
  number: number;
  name: string;
}

interface Award {
  id: string;
  name: string;
  place: number;
  winner: Team | string;
  category: 'team' | 'personal' | 'advancement';
}

interface AwardSectionProps {
  awardName: string;
  awardList: Award[];
}

export const AwardSection: React.FC<AwardSectionProps> = ({ awardName, awardList }) => {
  const getColorByPlace = (place: number | null): string => {
    switch (place) {
      case 1:
        return 'award.first';
      case 2:
        return 'award.second';
      case 3:
        return 'award.third';
      default:
        return 'award.other';
    }
  };

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{
          textAlign: 'left',
          mb: 2,
          fontWeight: 600,
          color: 'text.primary'
        }}
      >
        {awardName}
      </Typography>

      <Grid container spacing={2}>
        {awardList.map(award => {
          const isTeamAward = typeof award.winner !== 'string';
          const winnerText = isTeamAward
            ? `${(award.winner as Team).name} #${(award.winner as Team).number}`
            : (award.winner as string);

          const trophyColor = getColorByPlace(award.place);

          return (
            <Grid
              size={{ xs: 12, sm: 6, lg: 3 }}
              key={award.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200'
              }}
            >
              <EmojiEvents
                sx={{
                  color: trophyColor,
                  fontSize: '1.5rem'
                }}
              />

              {isTeamAward ? (
                <Typography
                  component={NextLink}
                  href={`/teams/${(award.winner as Team).number}`}
                  variant="body1"
                  fontWeight={600}
                  sx={{
                    textDecoration: 'none',
                    color: 'text.primary',
                    '&:hover': {
                      textDecoration: 'underline',
                      color: 'primary.main'
                    }
                  }}
                >
                  {winnerText}
                </Typography>
              ) : (
                <Typography
                  variant="body1"
                  fontWeight={600}
                  sx={{
                    color: 'text.primary'
                  }}
                >
                  {winnerText}
                </Typography>
              )}
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

interface DivisionAwardsProps {
  awards: Award[];
  eventSlug: string;
}

export const DivisionAwards: React.FC<DivisionAwardsProps> = ({ awards }) => {
  const t = useTranslations('pages.event');

  // Group awards by name, then sort by place
  const awardsByName = awards.reduce(
    (acc, award) => {
      if (!acc[award.name]) {
        acc[award.name] = [];
      }
      acc[award.name].push(award);
      return acc;
    },
    {} as Record<string, Award[]>
  );

  // Sort each award group by place
  Object.keys(awardsByName).forEach(awardName => {
    awardsByName[awardName].sort((a, b) => a.place - b.place);
  });

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h2" gutterBottom>
        {t('quick-links.awards')}
      </Typography>

      {Object.keys(awardsByName).length > 0 ? (
        <Stack spacing={3} divider={<Divider />}>
          {Object.entries(awardsByName).map(([awardName, awardList]) => (
            <AwardSection key={awardName} awardName={awardName} awardList={awardList} />
          ))}
        </Stack>
      ) : (
        <Box display="flex" alignItems="center" justifyContent="center" py={8}>
          <Typography variant="h6" color="text.secondary">
            {t('awards.no-data')}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
