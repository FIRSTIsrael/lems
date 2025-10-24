import {
  Select,
  SelectChangeEvent,
  OutlinedInput,
  Box,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme
} from '@mui/material';
import { CVFormSubjectTypes, CVFormSubject } from '@lems/types';
import { FastField, FieldProps } from 'formik';
import { localizedFormSubject } from '../../localization/cv-form';

interface CVFormSubjectSelectProps {
  name: string;
  label: string;
  readOnly?: boolean;
}

const CVFormSubjectSelect: React.FC<CVFormSubjectSelectProps> = ({ name, label, readOnly }) => {
  const theme = useTheme();

  const getStyles = (name: string, subjectList: readonly string[]) => {
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
          <InputLabel id="subject-chip-label">{label}</InputLabel>
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
                {selected.map((value: CVFormSubject) => (
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
              <MenuItem key={subject} value={subject} style={getStyles(subject, field.value)}>
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
