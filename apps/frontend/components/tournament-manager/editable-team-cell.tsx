import { WithId } from 'mongodb';
import { FastField, FieldProps } from 'formik';
import { Autocomplete, TextField } from '@mui/material';
import { Team } from '@lems/types';

interface EditableTeamCellProps {
  name: string;
  teams: Array<WithId<Team>>;
  disabled: boolean;
}

const EditableTeamCell: React.FC<EditableTeamCellProps> = ({ name, teams, disabled }) => {
  let dropdownOptions: Array<WithId<Team> | null> = [null];
  dropdownOptions = dropdownOptions.concat(teams.sort((a, b) => a.number - b.number));

  return (
    <FastField
      name={name}
      component={({ field, form }: FieldProps) => (
        <Autocomplete
          options={dropdownOptions}
          getOptionLabel={team => (team ? team.number.toString() : '-')}
          inputMode="search"
          disableClearable={field.value !== null}
          disabled={disabled}
          renderInput={params => (
            <TextField
              {...params}
              variant="standard"
              InputProps={{
                ...params.InputProps,
                disableUnderline: true
              }}
            />
          )}
          value={field.value}
          onChange={(_e, newValue) => form.setFieldValue(field.name, newValue)}
        />
      )}
    />
  );
};

export default EditableTeamCell;
