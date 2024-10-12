import { WithId } from 'mongodb';
import Grid from '@mui/material/Unstable_Grid2';
import { Award, AwardNames, Team } from '@lems/types';
import { Paper, Stack, Typography } from '@mui/material';
import { localizedAward } from '@lems/season';
import AwardList from '../award-list';
import { localizeTeam } from 'apps/frontend/localization/teams';

interface ReviewLayoutProps {
  awards: Array<WithId<Award>>;
}

const ReviewLayout: React.FC<ReviewLayoutProps> = ({ awards }) => {
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

  return (
    <Grid container pt={2} columnSpacing={4} rowSpacing={2} mx="10%">
      <Grid xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h2" textAlign="center">
            סיכום פרסים
          </Typography>
        </Paper>
      </Grid>
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
      {
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
      }
    </Grid>
  );
};

export default ReviewLayout;
