import { WithId } from 'mongodb';
import { FastField, FieldProps } from 'formik';
import { Autocomplete, AutocompleteProps, TextField } from '@mui/material';
import { Team } from '@lems/types';
import { localizeTeam } from '../../../localization/teams';

type FormikTeamFieldProps = {
  teams: Array<WithId<Team>>;
  numberOnly?: boolean;
  name: string;
  label?: string;
} & AutocompleteProps<WithId<Team> | null, false, false, false>;

const FormikTeamField: React.FC<FormikTeamFieldProps> = ({
  name,
  label,
  teams,
  numberOnly = false,
  ...props
}) => {
  return (
    <FastField name={name}>
      {({ field, form }: FieldProps) => (
        <Autocomplete<WithId<Team> | null, false, false, false>
          {...props}
          {...field}
          blurOnSelect
          options={teams}
          getOptionLabel={team =>
            typeof team !== 'string' && team
              ? numberOnly
                ? team.number.toString()
                : localizeTeam(team)
              : ''
          }
          inputMode="search"
          value={field.value}
          onChange={(_e, value) => form.setFieldValue(field.name, value)}
          renderInput={params => <TextField {...params} label="קבוצה" />}
          multiple={false}
        />
      )}
    </FastField>
  );
};

export default FormikTeamField;
