import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Container, Typography, Stack, Box } from '@mui/material';
import NoEquipmentImage from '../../../../../public/assets/scoresheet/no-equipment.svg';
import { MissionProvider } from './components/mission-context';
import { ScoreFloater } from './components/score-floater';
import { FieldTimer } from './components/field-timer';
import { ScoresheetForm } from './components/scoresheet-form';
import { ScorerPrintStyles } from './components/scorer-print-styles';
import { PrintScoreSummary } from './components/print-score-summary';

export default async function ScorerPage() {
  const t = await getTranslations('pages.tools.scorer');

  return (
    <>
      <ScorerPrintStyles />
      <MissionProvider>
        <Container maxWidth="md" sx={{ mt: 2 }}>
          <Box maxWidth="95%" mb={8}>
            <Typography variant="h2" gutterBottom sx={{ my: 2 }}>
              {t('title')}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
              <Image src={NoEquipmentImage} width={50} height={50} alt="איסור ציוד" />
              <Stack>
                <Typography fontWeight={500}>{t('no-equipment-constraint-title')}</Typography>
                <Typography>{t('no-equipment-constraint')}</Typography>
              </Stack>
            </Stack>

            <ScoresheetForm />
            <PrintScoreSummary />
          </Box>
        </Container>
        <ScoreFloater />
        <FieldTimer />
      </MissionProvider>
    </>
  );
}
