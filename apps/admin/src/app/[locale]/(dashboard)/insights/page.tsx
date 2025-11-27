import { useTranslations } from 'next-intl';
import { Container, Paper, Typography } from '@mui/material';
import PlaceholderChart from './placeholder-chart';

export default function InsightsPage() {
  const t = useTranslations('pages.insights');

  return (
    <Container
      maxWidth="lg"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh'
      }}
    >
      <Paper
        sx={{
          p: { xs: 2, sm: 4, md: 6 },
          minWidth: 400,
          maxWidth: 900,
          width: '100%'
        }}
      >
        <Typography variant="h1" align="center" gutterBottom>
          {t('coming-soon')}
        </Typography>
        <PlaceholderChart />
      </Paper>
    </Container>
  );
}
