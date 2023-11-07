import { localizedAward } from '@lems/season';
import { Award, Team } from '@lems/types';
import {
  AutocompleteRenderInputParams,
  Paper,
  TextField,
  Typography,
  Autocomplete
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { localizeTeam } from '../../../localization/teams';
import { WithId } from 'mongodb';
import { FastField, FieldProps } from 'formik';

interface AwardWinnerSelectorProps {
  award: WithId<Award>;
  awardIndex: number;
  teams: Array<WithId<Team>>;
  readOnly: boolean;
}

const AwardWinnerSelector: React.FC<AwardWinnerSelectorProps> = ({
  award,
  awardIndex,
  teams,
  readOnly
}) => {
  return (
    <Grid container key={award._id.toString()} component={Paper} p={2} alignItems="center">
      <Grid xs={4}>
        <Typography fontSize="1rem" fontWeight={700}>
          פרס {localizedAward[award.name].name}
        </Typography>
        <Typography fontSize="0.875rem" color="text.secondary">
          מקום {award.place}
        </Typography>
      </Grid>
      <Grid xs={8}>
        <FastField name={`${awardIndex}.winner`}>
          {({ field, form }: FieldProps) => (
            <Autocomplete
              options={teams}
              getOptionLabel={(winner: Team | string) =>
                typeof winner === 'string' ? winner : localizeTeam(winner)
              }
              freeSolo
              autoSelect
              blurOnSelect
              renderInput={(params: AutocompleteRenderInputParams) => (
                <TextField {...params} label="זוכה" />
              )}
              value={field.value}
              onChange={(_e, newValue) => {
                console.log(newValue);
                form.setFieldValue(field.name, newValue);
              }}
              readOnly={readOnly}
            />
          )}
        </FastField>
      </Grid>
    </Grid>
  );
};

export default AwardWinnerSelector;
