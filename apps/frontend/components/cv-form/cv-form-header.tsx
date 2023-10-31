import React from 'react';
import { FastField, FieldProps, FormikValues } from 'formik';
import { Typography, TextField } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import CVFormSubjectSelect from './cv-form-subject';

interface CVFormHeaderProps {
  values: FormikValues;
  disabled?: boolean;
}

const CVFormHeader: React.FC<CVFormHeaderProps> = ({ values, disabled }) => {
  return (
    <Grid container spacing={2} sx={{ my: 2 }}>
      <Grid xs={12} md={5}>
        <Typography variant="h2" sx={{ mb: 2 }}>
          טופס ערכי ליבה
        </Typography>
        <Typography color="text.secondary" fontSize="0.875rem">
          טופס ערכי הליבה נועד על מנת לתעד עדויות של התרחשויות, בין אם הן טובות או לא, של קבוצות,
          תלמידים, מנטורים ומתנדבים ולשתפן עם השופט הראשי ומנהל האירוע.
        </Typography>
      </Grid>

      <Grid container xs={12} md={6}>
        {['demonstrators', 'observers'].map(subjectType => (
          <React.Fragment key={subjectType}>
            <Grid xs={12}>
              <Typography fontSize="0.875rem">
                סמנו מי {subjectType === 'observers' ? 'היו עדים' : 'גרמו'} להתרחשות
              </Typography>
            </Grid>
            <Grid xs={values[subjectType].includes('team') ? 6 : 12}>
              <CVFormSubjectSelect
                name={subjectType}
                label={subjectType === 'observers' ? 'עדים' : 'גורמים'}
                disabled={disabled}
              />
            </Grid>
            {values[subjectType].includes('team') && (
              <Grid xs={6} sx={{ display: 'flex' }}>
                <FastField name={`${subjectType.slice(0, -1)}Affiliation`}>
                  {({ field, form }: FieldProps) => (
                    <TextField
                      fullWidth
                      label="מספר קבוצה"
                      sx={{
                        '& .MuiInputBase-root': {
                          height: '100%'
                        }
                      }}
                      {...field}
                      value={field.value}
                      disabled={disabled}
                      onChange={e => form.setFieldValue(field.name, e.target.value)}
                    />
                  )}
                </FastField>
              </Grid>
            )}
          </React.Fragment>
        ))}
      </Grid>
    </Grid>
  );
};

export default CVFormHeader;
