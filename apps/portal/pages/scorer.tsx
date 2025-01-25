import { NextPage } from 'next';
import { Container, Typography, Stack } from '@mui/material';
import { SEASON_SCORESHEET } from '@lems/season';
import ScoresheetMission from '../components/scorer/scoresheet-mission';

const Page: NextPage = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 2 }}>
      <Typography variant="h2" gutterBottom sx={{ my: 2 }}>
        מחשבון ניקוד
      </Typography>
      <Typography>תיאור של בונוס ביקורת ציוד</Typography>
      <Stack spacing={4} my={2}>
        {SEASON_SCORESHEET.missions.map((mission, index) => (
          <ScoresheetMission
            key={mission.id}
            missionIndex={index}
            src={`/assets/scoresheet/missions/${mission.id}.webp`}
            mission={mission}
            errors={[]}
            // errors={missionInfo.find(e => e?.id == mission.id)?.errors}
            // readOnly={readOnly}
          />
        ))}
      </Stack>
    </Container>
  );
};

export default Page;
