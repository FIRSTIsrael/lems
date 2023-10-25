import { useState, useMemo, useCallback } from 'react';
import { WithId } from 'mongodb';
import { Field, FieldProps, FormikValues, useFormikContext } from 'formik';
import { Autocomplete, TextField, Button, Typography, TableCell } from '@mui/material';
import { Team } from '@lems/types';

interface JudgingEditorTeamCellProps {
  name: string;
  teams: Array<WithId<Team>>;
  disabled: boolean;
}

const JudgingEditorTeamCell: React.FC<JudgingEditorTeamCellProps> = ({ name, teams, disabled }) => {
  const [editable, setEditable] = useState<boolean>(false);
  let dropdownOptions: Array<WithId<Team> | null> = [null];
  dropdownOptions = dropdownOptions.concat(teams.sort((a, b) => a.number - b.number));

  const { values, getFieldMeta } = useFormikContext();

  const getOccurancesInForm = useCallback(
    (team?: WithId<Team>) => {
      if (!team) return 1;
      return Object.values(values as FormikValues).filter(v => v === team).length;
    },
    [values]
  );

  const fieldOccurances = useMemo(
    () => getOccurancesInForm((getFieldMeta(name).value as WithId<Team>) || undefined),
    [getFieldMeta, getOccurancesInForm, name]
  );

  return (
    <TableCell align="left">
      <Field
        name={name}
        component={({ field, form }: FieldProps) =>
          editable ? (
            <Autocomplete
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
                  InputProps={{
                    ...params.InputProps,
                    disableUnderline: true
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
                  backgroundColor: field.value && fieldOccurances > 1 ? '#fff3e7' : '#f7f5f5'
                }
              }}
            >
              <Typography
                sx={{
                  color: field.value && fieldOccurances > 1 ? '#f57c00' : '#000'
                }}
              >
                {field.value ? field.value.number.toString() : '-'}
              </Typography>
            </Button>
          )
        }
      />
    </TableCell>
  );
};

export default JudgingEditorTeamCell;
