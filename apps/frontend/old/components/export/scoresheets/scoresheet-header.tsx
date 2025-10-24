import { WithId } from 'mongodb';
import { Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { DivisionWithEvent, Team, Scoresheet , SEASON_NAME } from '@lems/types';
import { localizeDivisionTitle } from '../../../localization/event';

interface ScoresheetHeaderProps {
  division: WithId<DivisionWithEvent>;
  team: WithId<Team>;
  scoresheet: WithId<Scoresheet>;
}

export const ScoresheetHeader: React.FC<ScoresheetHeaderProps> = ({
  division,
  team,
  scoresheet
}) => {
  return (
    <Grid container>
      <Grid size={10}>
        <Stack justifyContent="space-between" height="100%">
          <Typography fontSize="0.75rem" color="textSecondary">
            הופק מתוך מערכת האירועים של <em>FIRST</em> ישראל ({scoresheet._id.toString()}) |{' '}
            {localizeDivisionTitle(division)} | עונת <span dir="ltr">{SEASON_NAME}</span>
          </Typography>
          <Typography fontSize="1.75rem" fontWeight={700}>
            דף ניקוד {scoresheet.round} של קבוצה #{team.number}
          </Typography>
        </Stack>
      </Grid>
      <Grid size={2}>
        { }
        <img
          alt="לוגו של תוכניות FIRST LEGO League Challenge"
          src="/assets/audience-display/sponsors/fllc-horizontal.svg"
        />
      </Grid>
    </Grid>
  );
};
