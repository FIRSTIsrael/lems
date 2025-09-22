import { getTranslations } from 'next-intl/server';
import { Container, Typography } from '@mui/material';
import { Timer } from './components/timer';

export default async function FieldTimerPage() {
  const t = await getTranslations('pages.tools.scorer');

  return (
    <Container maxWidth="md" sx={{ mt: 2 }}>
      <Typography variant="h2" gutterBottom sx={{ my: 2 }}>
        {t('title')}
      </Typography>
      <Timer />
    </Container>
  );
}
