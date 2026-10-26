import { Fragment } from 'react';
import { Grid, Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMatchTranslations } from '@lems/localization';
import { MatchParticipant } from './graphql';
import { MatchParticipantCard } from './match-participant-card';

interface MatchPairCardProps {
  name: string;
  sides: { table: { id: string }; participant: MatchParticipant | null }[];
}

export const MatchPairCard: React.FC<MatchPairCardProps> = ({ name, sides }) => {
  const t = useTranslations('pages.audience-display.match-preview');
  const { getVersus } = useMatchTranslations();

  const filledSides = sides.filter(side => side.participant?.team);

  return (
    <Grid size={1} sx={{ display: 'flex' }}>
      <Stack spacing={2} sx={{ flex: 1 }}>
        <Typography
          sx={{
            fontSize: { xs: '1rem', md: '1.25rem', lg: '1.5rem' },
            fontWeight: 700,
            color: 'primary.main',
            textAlign: 'center'
          }}
        >
          {t('table')} {name}
        </Typography>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'stretch', flex: 1 }}>
          {filledSides.map((side, index) => (
            <Fragment key={side.table.id}>
              {index > 0 && (
                <Typography
                  sx={{
                    alignSelf: 'center',
                    fontSize: { xs: '1rem', md: '1.25rem', lg: '1.5rem' },
                    fontWeight: 700,
                    color: 'text.secondary'
                  }}
                >
                  {getVersus()}
                </Typography>
              )}
              <Stack sx={{ flex: 1, display: 'flex' }}>
                {side.participant && <MatchParticipantCard participant={side.participant} nested />}
              </Stack>
            </Fragment>
          ))}
        </Stack>
      </Stack>
    </Grid>
  );
};
