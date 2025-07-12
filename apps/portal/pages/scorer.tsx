import { NextPage, GetStaticProps, GetStaticPropsContext } from 'next';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Container, Typography, Stack, Box } from '@mui/material';
import { SEASON_SCORESHEET } from '@lems/season';
import { getMessages } from '../locale/get-messages';
import ScoresheetMission from '../components/scorer/scoresheet-mission';
import NoEquipmentImage from '../public/assets/scoresheet/no-equipment.svg';
import { MissionProvider, useScoresheetValidator } from '../components/scorer/mission-context';
import ScoreFloater from '../components/scorer/score-floater';

const Scorer = () => {
  const { errors } = useScoresheetValidator();
  const t = useTranslations('pages.scorer');

  return (
    <>
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

          <Stack spacing={4} mt={4} mb={16}>
            {SEASON_SCORESHEET.missions.map((mission, index) => (
              <ScoresheetMission
                key={mission.id}
                missionIndex={index}
                src={`/assets/scoresheet/missions/${mission.id}.webp`}
                mission={mission}
              />
            ))}
            {errors.map((error, index) => (
              <Typography key={index} color="error" fontWeight={600}>
                {error.description}
              </Typography>
            ))}
          </Stack>
        </Box>
      </Container>
      <ScoreFloater />
    </>
  );
};

const Page: NextPage = () => {
  return (
    <MissionProvider>
      <Scorer />
    </MissionProvider>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }: GetStaticPropsContext) => {
  const messages = await getMessages(locale);
  return { props: { messages } };
};

export default Page;
