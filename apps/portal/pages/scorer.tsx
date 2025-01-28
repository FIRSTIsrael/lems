import { NextPage } from 'next';
import Image from 'next/image';
import { Container, Typography, Stack, Box } from '@mui/material';
import { SEASON_SCORESHEET } from '@lems/season';
import ScoresheetMission from '../components/scorer/scoresheet-mission';
import NoEquipmentImage from '../public/assets/scoresheet/no-equipment.svg';
import { MissionProvider } from '../components/scorer/mission-context';
import ScoreFloater from '../components/scorer/score-floater';

const Scorer = () => {
  return (
    <>
      <Container maxWidth="md" sx={{ mt: 2 }}>
        <Box maxWidth="95%" mb={8}>
          <Typography variant="h2" gutterBottom sx={{ my: 2 }}>
            מחשבון ניקוד
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
            <Image src={NoEquipmentImage} width={50} height={50} alt="איסור ציוד" />
            <Stack>
              <Typography fontWeight={500}>מגבלת ”ללא מגע ציוד של הקבוצה“:</Typography>
              <Typography>
                כאשר סמל זה מופיע בפינה השמאלית העליונה של משימה, המגבלה הבאה חלה: על מנת לקבל ניקוד
                על משימה זו, אסור לציוד לגעת באף חלק של דגם המשימה בסיום המקצה.“
              </Typography>
            </Stack>
          </Stack>

          <Stack spacing={4} my={4}>
            {SEASON_SCORESHEET.missions.map((mission, index) => (
              <ScoresheetMission
                key={mission.id}
                missionIndex={index}
                src={`/assets/scoresheet/missions/${mission.id}.webp`}
                mission={mission}
                errors={[]}
              />
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

export default Page;
