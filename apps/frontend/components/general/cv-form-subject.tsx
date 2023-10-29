import {
  Select,
  SelectChangeEvent,
  OutlinedInput,
  Box,
  Chip,
  MenuItem,
  Theme,
  FormControl,
  InputLabel
} from '@mui/material';
import { CVFormSubjectTypes, CVFormSubject } from '@lems/types';
import theme from '../../lib/theme';
import { localizedFormSubject } from '../../localization/cv-form';
import { FastField, FieldProps } from 'formik';

interface CVFormSubjectSelectProps {
  name: string;
  readOnly: boolean;
}

const CVFormSubjectSelect: React.FC<CVFormSubjectSelectProps> = ({ name, readOnly }) => {
  const getStyles = (name: string, subjectList: readonly string[], theme: Theme) => {
    return {
      fontWeight:
        subjectList.indexOf(name) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium
    };
  };

  return (
    <FastField name={name}>
      {({ field, form }: FieldProps) => (
        <FormControl fullWidth>
          <InputLabel id="subject-chip-label">עדים</InputLabel>
          <Select
            labelId="subject-chip-label"
            id="subject-chip"
            multiple
            readOnly={readOnly}
            value={field.value}
            onChange={(e: SelectChangeEvent<Array<CVFormSubject>>) =>
              form.setFieldValue(field.name, e.target.value)
            }
            input={<OutlinedInput id="select-multiple-chip" label="תפקידים" />}
            renderValue={selected => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map(value => (
                  <Chip key={value} label={localizedFormSubject[value]} />
                ))}
              </Box>
            )}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 48 * 4.5 + 8,
                  width: 250
                }
              }
            }}
          >
            {CVFormSubjectTypes.map(subject => (
              <MenuItem
                key={subject}
                value={subject}
                style={getStyles(subject, field.value, theme)}
              >
                {localizedFormSubject[subject]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </FastField>
  );
};

export default CVFormSubjectSelect;
