import { WithId } from 'mongodb';
import { DivisionWithEvent, JudgingCategory, Rubric, SEASON_NAME, Team } from '@lems/types';
import Grid from '@mui/material/Grid';
import { Stack, Typography } from '@mui/material';
import { localizeDivisionTitle } from '../../../../localization/event';

interface RubricHeaderProps {
  rubric: WithId<Rubric<JudgingCategory>>;
  division: WithId<DivisionWithEvent>;
  team: WithId<Team>;
}

export const SessionFeedbackHeader: React.FC<RubricHeaderProps> = ({ rubric, division, team }) => {
  return (
    <>
      <Grid size={10}>
        <Stack justifyContent="space-between" height="100%" spacing={0.5}>
          <Typography fontSize="0.65rem" color="textSecondary">
            הופק מתוך מערכת האירועים של <em>FIRST</em> ישראל ({rubric._id.toString()}) |{' '}
            {localizeDivisionTitle(division)} | עונת <span dir="ltr">{SEASON_NAME}</span>
          </Typography>
          <Typography fontSize="1.5rem" fontWeight={700}>
            פידבק ממפגש השיפוט של קבוצה #{team.number}
          </Typography>
        </Stack>
      </Grid>
      <Grid size={2}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="לוגו של תוכניות FIRST LEGO League Challenge"
          src="/assets/audience-display/sponsors/fllc-horizontal.svg"
        />
      </Grid>
    </>
  );
};
