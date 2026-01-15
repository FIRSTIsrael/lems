'use client';

import { useParams } from 'next/navigation';
import { Typography, Box, Grid } from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';
import NextLink from 'next/link';
import { Award, Team } from '@lems/types/api/portal';
import { useAwardTranslations } from '@lems/localization';

interface AwardRowProps {
  awardName: string;
  awardList: Award[];
  teams: Team[];
}

export const AwardRow: React.FC<AwardRowProps> = ({ awardName, awardList, teams }) => {
  const params = useParams();
  const eventSlug = params.slug as string;

  const { getName } = useAwardTranslations();

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
        {getName(awardName)}
      </Typography>

      <Grid container spacing={2}>
        {awardList.map(award => {
          if (!award.winner) {
            return null;
          }
          const isTeamAward = award.type === 'TEAM';
          const team = isTeamAward ? teams.find(t => t.id === award.winner) : null;
          const winnerText = team ? `${team.name} #${team.number}` : (award.winner as string);

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
              {award.showPlaces && (
                <EmojiEvents
                  sx={{
                    color: trophyColor,
                    fontSize: '1.5rem'
                  }}
                />
              )}

              {team ? (
                <Typography
                  component={NextLink}
                  href={`/event/${eventSlug}/team/${team.slug}`}
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
