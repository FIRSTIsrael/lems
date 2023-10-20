import { WithId } from 'mongodb';
import { Field, FieldProps } from 'formik';
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
    <Field
      name={name}
      component={({ field, form }: FieldProps) => (
        <Autocomplete
          options={dropdownOptions.sort((a, b) => {
            if (!a) return -1;
            if (!b) return 1;

            return (
              Object.values(form.values).filter(v => v === a).length -
              Object.values(form.values).filter(v => v === b).length
            );
          })}
          getOptionLabel={team => (team ? team.number.toString() : '-')}
          groupBy={team =>
            !team
              ? ''
              : Object.values(form.values).filter(v => v === team).length === 0
              ? 'חסר'
              : 'קיים'
          }
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
          sx={{
            '& .MuiAutocomplete-inputRoot': {
              color:
                Object.values(form.values).filter(v => v === field.value).length > 1
                  ? '#f57c00'
                  : ''
            }
          }}
          value={field.value}
          onChange={(_e, newValue) => form.setFieldValue(field.name, newValue)}
        />
      )}
    />
  );
};

export default EditableTeamCell;
