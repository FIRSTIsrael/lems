import { useState, useMemo, useCallback } from 'react';
import { WithId } from 'mongodb';
import { Field, FieldProps, useFormikContext, FormikValues } from 'formik';
import { Autocomplete, TextField, Button, Typography, TableCell } from '@mui/material';
import { Team } from '@lems/types';

interface RoundEditorTeamCellProps {
  name: string;
  teams: Array<WithId<Team>>;
  disabled: boolean;
}

const RoundEditorTeamCell: React.FC<RoundEditorTeamCellProps> = ({ name, teams, disabled }) => {
  const [editable, setEditable] = useState<boolean>(false);
  let dropdownOptions: Array<WithId<Team> | null> = [null];
  dropdownOptions = dropdownOptions.concat(teams.sort((a, b) => a.number - b.number));

  const { values, getFieldMeta } = useFormikContext();

  const getOccurancesInForm = useCallback(
    (team?: WithId<Team>) => {
      if (!team) return 1;
      return Object.values(values as FormikValues)
        .flatMap(matchData => Object.values(matchData))
        .filter(_team => (_team as WithId<Team>)?._id === team._id).length;
    },
    [values]
  );

  const fieldOccurances = useMemo(
    () => getOccurancesInForm((getFieldMeta(name).value as WithId<Team>) || undefined),
    [getFieldMeta, getOccurancesInForm, name]
  );

  return (
    <TableCell align="left">
      <Field name={name}>
        {({ field, form }: FieldProps) =>
          editable ? (
            <Autocomplete
              blurOnSelect
              options={dropdownOptions.sort((a, b) => {
                if (!a) return -1;
                if (!b) return 1;

                return getOccurancesInForm(a) - getOccurancesInForm(b);
              })}
              getOptionLabel={team => (team ? team.number.toString() : '-')}
              groupBy={team => (!team ? '' : getOccurancesInForm(team) === 0 ? 'חסר' : 'קיים')}
              inputMode="search"
              disableClearable={field.value !== null}
              disabled={disabled}
              renderInput={params => (
                <TextField
                  {...params}
                  variant="standard"
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      disableUnderline: true
                    }
                  }}
                />
              )}
              sx={{
                '& .MuiAutocomplete-inputRoot': {
                  color: fieldOccurances > 1 ? '#f57c00' : ''
                }
              }}
              value={field.value}
              onChange={(_e, newValue) => form.setFieldValue(field.name, newValue)}
            />
          ) : (
            <Button
              variant="text"
              disabled={disabled}
              onClick={e => setEditable(true)}
              sx={{
                ml: -2,
                '&:hover': {
                  backgroundColor: field.value && fieldOccurances > 1 ? '#f57c00' : '#f7f5f5'
                }
              }}
            >
              <Typography
                sx={
                  !disabled
                    ? { color: field.value && fieldOccurances > 1 ? '#f57c00' : '#000' }
                    : {}
                }
              >
                {field.value ? field.value.number.toString() : '-'}
              </Typography>
            </Button>
          )
        }
      </Field>
    </TableCell>
  );
};

export default RoundEditorTeamCell;
