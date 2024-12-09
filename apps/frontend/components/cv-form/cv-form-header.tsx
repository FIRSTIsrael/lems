import React from 'react';
import { WithId } from 'mongodb';
import { FormikValues } from 'formik';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Team } from '@lems/types';
import CVFormSubjectSelect from './cv-form-subject';
import FormikTeamField from '../general/forms/formik-team-field';

interface CVFormHeaderProps {
  teams: Array<WithId<Team>>;
  values: FormikValues;
  readOnly?: boolean;
}

const CVFormHeader: React.FC<CVFormHeaderProps> = ({ teams, values, readOnly }) => {
  return (
    <Grid container spacing={2} sx={{ my: 2 }}>
      <Grid
        size={{
          xs: 12,
          md: 5
        }}
      >
        <Typography variant="h2" sx={{ mb: 2 }}>
          טופס ערכי ליבה
        </Typography>
        <Typography color="textSecondary" fontSize="0.875rem">
          טופס ערכי הליבה נועד על מנת לתעד עדויות של התרחשויות, בין אם הן טובות או לא, של קבוצות,
          תלמידים, מנטורים ומתנדבים ולשתפן עם השופט הראשי ומנהל האירוע.
        </Typography>
      </Grid>
      <Grid
        container
        size={{
          xs: 12,
          md: 6
        }}
      >
        {['demonstrators', 'observers'].map(subjectType => (
          <React.Fragment key={subjectType}>
            <Grid size={12}>
              <Typography fontSize="0.875rem">
                סמנו מי {subjectType === 'observers' ? 'היו עדים' : 'גרמו'} להתרחשות
              </Typography>
            </Grid>
            <Grid size={values[subjectType].includes('team') ? 6 : 12}>
              <CVFormSubjectSelect
                name={subjectType}
                label={subjectType === 'observers' ? 'עדים' : 'גורמים'}
                readOnly={readOnly}
              />
            </Grid>
            {values[subjectType].includes('team') && (
              <Grid sx={{ display: 'flex' }} size={6}>
                <FormikTeamField
                  teams={teams}
                  name={`${subjectType.slice(0, -1)}Affiliation`}
                  fullWidth
                />
              </Grid>
            )}
          </React.Fragment>
        ))}
      </Grid>
    </Grid>
  );
};

export default CVFormHeader;
