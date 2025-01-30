import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';
import {
  Avatar,
  Container,
  Paper,
  Stack,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { PortalAward, PortalEvent, PortalTeam, PortalActivity, PortalScore } from '@lems/types';
import { localizedAward, localizedAwardPlace } from '@lems/season';
import { fetchEvent, fetchTeam } from '../../../../lib/api';
import { getColorByPlace } from '../../../../lib/styling';

interface Props {
  team: PortalTeam;
  awards: PortalAward[] | null;
  schedule: PortalActivity<'match' | 'session' | 'general'>[];
  event: PortalEvent;
  scores: PortalScore;
}

const Page: NextPage<Props> = ({ team, awards, event, schedule, scores }) => {
  console.log(scores);
  return (
    <Container maxWidth="md" sx={{ mt: 2 }}>
      <Grid container rowSpacing={2} columnSpacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Grid container component={Paper} p={2} alignItems="center">
            <Grid size={4}>
              <Avatar
                src="/assets/default-avatar.svg"
                alt="לוגו קבוצתי"
                sx={{ width: 72, height: 72 }}
              />
            </Grid>
            <Grid size={8}>
              <Typography variant="h2">
                👥 {team.name} #{team.number}
              </Typography>
              <Typography variant="h6">
                🏫 {team.affiliation.name}, {team.affiliation.city}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                🎉 {event.name}
                {event.isDivision && ` - ${event.subtitle}`}
              </Typography>
            </Grid>
          </Grid>
          {awards && awards.length > 0 && (
            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography variant="h2" gutterBottom>
                פרסים
              </Typography>
              {awards
                .filter(award => award.name !== 'advancement')
                .map(award => (
                  <Stack direction="row" spacing={1} key={award.name} alignItems="center">
                    <EmojiEventsIcon sx={{ color: getColorByPlace(award.place) }} />
                    <Typography variant="body1">
                      {localizedAward[award.name].name}, מקום {localizedAwardPlace[award.place]}
                    </Typography>
                  </Stack>
                ))}
            </Paper>
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TableContainer component={Paper} sx={{ p: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography fontWeight={500}>מקצה</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={500}>ניקוד</Typography>
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              {/* <TableBody> */}
              {/* {scores.map(score => (
                  <TableRow
                    key={team.id}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                      },
                      '&:active': {
                        backgroundColor: 'rgba(0, 0, 0, 0.08)'
                      }
                    }}
                    onClick={() => router.push(`/events/${eventId}/teams/${team.number}`)}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {team.name} #{team.number}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {`${team.affiliation.name}, ${team.affiliation.city}`}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ChevronLeftIcon />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody> */}
            </Table>
          </TableContainer>
        </Grid>
        <Typography variant="h2">Team scores</Typography>
        <Typography variant="h2">Schedule</Typography>
      </Grid>
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const eventId = ctx.params?.id as string;
  const teamNumber = ctx.params?.number as string;

  const { team, awards, schedule, scores } = await fetchTeam(eventId, teamNumber);
  const { event } = await fetchEvent(eventId);
  return { props: { team, awards, schedule, scores, event } };
};

export default Page;
