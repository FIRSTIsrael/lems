import { WithId } from 'mongodb';
import { FastField, FieldProps } from 'formik';
import { Paper, TextField, Typography, Autocomplete, Stack } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { Team } from '@lems/types';
import { localizeTeam } from '../../../localization/teams';

interface AdvancingTeamsSelectorProps {
  teams: Array<WithId<Team>>;
  readOnly?: boolean;
}

const AdvancingTeamsSelector: React.FC<AdvancingTeamsSelectorProps> = ({ teams, readOnly }) => {
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
                  blurOnSelect
                  options={teams}
                  getOptionLabel={team => (team ? localizeTeam(team) : '')}
                  inputMode="search"
                  value={field.value}
                  onChange={(_e, value) =>
                    form.setFieldValue(field.name, typeof value !== 'string' ? value : null)
                  }
                  renderInput={params => <TextField {...params} />}
                />
                {/* <Typography>
                  {field.value.map((team: Team) => localizeTeam(team)).join(', ')}
                </Typography> */}
              </Stack>
            );
          }}
        </FastField>
      </Grid>
    </Grid>
  );
};

export default AdvancingTeamsSelector;
