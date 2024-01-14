import { WithId } from 'mongodb';
import { FastField, FieldProps } from 'formik';
import {
  AutocompleteRenderInputParams,
  Paper,
  TextField,
  Typography,
  Autocomplete,
  Stack
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { Team } from '@lems/types';
import { localizeTeam } from '../../../localization/teams';

interface AdvancingTeamsSelectorProps {
  teams: Array<WithId<Team>>;
  readOnly?: boolean;
}

const AdvancingTeamsSelector: React.FC<AdvancingTeamsSelectorProps> = ({ teams, readOnly }) => {
  console.log(teams);
  return (
    <Grid container component={Paper} p={2} alignItems="center">
      <Grid xs={4}>
        <Typography fontSize="1rem" fontWeight={700}>
          קבוצות המעפילות לאליפות
        </Typography>
      </Grid>
      <Grid xs={8}>
        <FastField name="advancingTeams">
          {({ field, form }: FieldProps) => {
            return (
              <Stack spacing={2}>
                <Autocomplete
                  options={teams}
                  getOptionLabel={(team: Team) => {
                    console.log(team);
                    return '';
                  }}
                  renderInput={params => <TextField {...params} />}
                  value={field.value}
                  onChange={(_e, newValue) => form.setFieldValue(field.name, newValue)}
                  readOnly={readOnly}
                />
                <Typography>
                  {field.value.map((team: Team) => localizeTeam(team)).join(', ')}
                </Typography>
              </Stack>
            );
          }}
        </FastField>
      </Grid>
    </Grid>
  );
};

export default AdvancingTeamsSelector;
