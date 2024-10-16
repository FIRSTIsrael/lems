import { WithId } from 'mongodb';
import Grid from '@mui/material/Unstable_Grid2';
import { Award, AwardNames, JudgingDeliberation, Team } from '@lems/types';
import { Paper, Stack, Typography, Button } from '@mui/material';
import { localizedAward } from '@lems/season';
import AwardList from '../award-list';
import { localizeTeam } from 'apps/frontend/localization/teams';
import PersonalAwardWinnerList from './personal-award-winner-list';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { DeliberationContext } from '../deliberation';

interface ReviewLayoutProps {
  awards: Array<WithId<Award>>;
  onSubmit: (deliberation: WithId<JudgingDeliberation>) => void;
}

const ReviewLayout: React.FC<ReviewLayoutProps> = ({ awards, onSubmit }) => {
  const router = useRouter();
  const { deliberation } = useContext(DeliberationContext);

  const awardsByName = awards.reduce(
    (acc, award) => {
      const copy = [...(acc[award.name] ?? []), award];
      acc[award.name] = copy.sort((a, b) => a.place - b.place);
      return acc;
    },
    {} as Record<AwardNames, Array<WithId<Award>>>
  );

  const {
    advancement,
    'lead-mentor': leadMentor,
    'volunteer-of-the-year': voty,
    ...restAwards
  } = awardsByName;

  const personalAwards = { 'lead-mentor': leadMentor, 'volunteer-of-the-year': voty };

  const awardsLoaded = Object.values(restAwards).every(
    winners => !!winners.every(w => typeof w.winner !== 'string' && w.winner?._id)
  );

  return (
    <Grid container pt={2} columnSpacing={4} rowSpacing={2} mx="10%">
      <Grid xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h2" textAlign="center">
            סיכום פרסים
          </Typography>
        </Paper>
      </Grid>
      {awardsLoaded && (
        <>
          {Object.keys(restAwards).map(award => {
            const _award = award as AwardNames;
            return (
              <Grid key={award} xs={2}>
                <AwardList
                  title={`פרס ${localizedAward[_award].name}`}
                  length={awardsByName[_award].length}
                  withIcons
                  trophyCount={awardsByName[_award].length}
                  disabled={true}
                  pickList={awardsByName[_award].map(award => (award.winner as WithId<Team>)!)}
                  id={_award}
                />
              </Grid>
            );
          })}
          {advancement && advancement.length > 0 && (
            <Grid xs={4}>
              <Stack component={Paper} p={2} spacing={1}>
                <Typography fontWeight={600} fontSize="1.5rem">
                  קבוצות המעפילות שלב
                </Typography>
                {advancement.map((award, index) => (
                  <Typography key={String(award._id)}>
                    {index + 1}. {localizeTeam(award.winner as Team)}
                  </Typography>
                ))}
              </Stack>
            </Grid>
          )}
          {personalAwards &&
            Object.entries(personalAwards).map(([title, awards]) => {
              if (!awards?.length || !awards?.every(a => typeof a.winner === 'string')) return null;
              return (
                <Grid xs={3} key={title}>
                  <PersonalAwardWinnerList
                    title={title as AwardNames}
                    winners={awards.map(a => String(a.winner))}
                  />
                </Grid>
              );
            })}
          <Grid xs={12}>
            <Stack direction="row" justifyContent="center">
              <Button
                variant="contained"
                sx={{ width: 250 }}
                onClick={() => {
                  onSubmit(deliberation);
                  router.push('/lems/judge-advisor');
                }}
              >
                אישור הפרסים
              </Button>
            </Stack>
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default ReviewLayout;
