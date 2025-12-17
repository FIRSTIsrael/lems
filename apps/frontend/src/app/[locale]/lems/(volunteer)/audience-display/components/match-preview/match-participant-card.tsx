import { Grid, Stack, alpha, Box, Avatar, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { MatchParticipant } from './graphql';

interface MatchParticipantCardProps {
  participant: MatchParticipant;
}

export const MatchParticipantCard: React.FC<MatchParticipantCardProps> = ({ participant }) => {
  const t = useTranslations('pages.audience-display.match-preview');

  if (!participant.team) {
    return <></>;
  }

  return (
    <Grid key={participant.team.id} size={1} display="flex">
      <Stack
        spacing={2}
        justifyContent="space-between"
        sx={{
          flex: 1,
          p: 3,
          borderRadius: 1.5,
          border: '2px solid',
          borderColor: 'divider',
          backgroundColor: theme => alpha(theme.palette.primary.main, 0.05)
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Avatar
            src={participant.team.logoUrl ?? '/assets/default-avatar.svg'}
            sx={{
              width: 60,
              height: 60,
              color: 'white',
              objectFit: 'cover'
            }}
          />

          <Typography
            sx={{
              fontSize: { xs: '1.75rem', md: '2.25rem', lg: '2.75rem' },
              fontWeight: 700,
              color: 'primary.main'
            }}
          >
            #{participant.team.number}
          </Typography>
        </Box>

        <Typography
          sx={{
            fontSize: { xs: '0.95rem', md: '1.15rem', lg: '1.35rem' },
            fontWeight: 700,
            color: 'black',
            wordBreak: 'break-word',
            lineHeight: 1.3
          }}
        >
          {participant.team.name}
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: '0.8rem', md: '0.95rem', lg: '1.1rem' },
            fontWeight: 500,
            color: 'text.secondary',
            wordBreak: 'break-word',
            lineHeight: 1.3
          }}
        >
          {participant.team.affiliation}, {participant.team.city}
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: '0.75rem', md: '0.9rem', lg: '1rem' },
            fontWeight: 600,
            color: 'primary.main',
            mt: 'auto'
          }}
        >
          {t('table')} {participant.table.name}
        </Typography>
      </Stack>
    </Grid>
  );
};
