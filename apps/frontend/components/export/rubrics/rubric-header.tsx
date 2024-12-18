import { WithId } from 'mongodb';
import { JudgingCategory, Rubric, SEASON_NAME, DivisionWithEvent } from '@lems/types';
import Grid from '@mui/material/Grid2';
import { Stack, Typography } from '@mui/material';
import { localizedJudgingCategory } from '@lems/season';
import { RubricsSchema } from '@lems/season';
import Markdown from 'react-markdown';
import { localizeDivisionTitle } from '../../../localization/event';

interface RubricHeaderProps {
  rubric: WithId<Rubric<JudgingCategory>>;
  schema: RubricsSchema;
  division: WithId<DivisionWithEvent>;
  team: {
    number: string;
  };
}

export const RubricHeader: React.FC<RubricHeaderProps> = ({ rubric, schema, division, team }) => {
  const hasAwards = Object.entries(rubric.data?.awards ?? {}).length > 0;
  console.log(rubric.category, hasAwards);

  return (
    <>
      <Grid size={10}>
        <Stack justifyContent="space-between" height="100%" spacing={0.5}>
          <Typography fontSize="0.65rem" color="textSecondary">
            הופק מתוך מערכת האירועים של <em>FIRST</em> ישראל ({rubric._id.toString()}) |{' '}
            {localizeDivisionTitle(division)} | עונת <span dir="ltr">{SEASON_NAME}</span>
          </Typography>
          <Typography fontSize="1.5rem" fontWeight={700}>
            מחוון {localizedJudgingCategory[rubric.category].name} של קבוצה #{team.number}
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

      <Grid size={hasAwards ? 4 : 12}>
        <Typography fontSize="0.875rem">
          <Markdown>{schema.description}</Markdown>
        </Typography>
      </Grid>
    </>
  );
};
