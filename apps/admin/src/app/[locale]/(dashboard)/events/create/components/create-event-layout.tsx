'use client';

import { useTranslations } from 'next-intl';
import { Formik, Form, FormikErrors } from 'formik';
import { Paper, Typography, Box, Stack } from '@mui/material';
import Grid from '@mui/material/Grid';
import { FormikDatePicker, FormikTextField } from '@lems/shared';
import { isValidSlug } from '../../utils';

interface EventFormValues {
  name: string;
  slug: string;
  date: Date | null;
  location: string;
}

const initialValues: EventFormValues = {
  name: '',
  slug: '',
  date: null,
  location: ''
};

export const CreateEventLayout = () => {
  const t = useTranslations('pages.events.create.form');

  const validate = (values: EventFormValues): FormikErrors<EventFormValues> => {
    const errors: FormikErrors<EventFormValues> = {};

    // Name validation
    if (!values.name) {
      errors.name = t('validation.name.required');
    } else if (values.name.length < 2) {
      errors.name = t('validation.name.min', { min: 2 });
    }

    // Slug validation
    if (!values.slug) {
      errors.slug = t('validation.slug.required');
    } else if (!isValidSlug(values.slug)) {
      errors.slug = t('validation.slug.format');
    }

    // Date validation
    if (!values.date) {
      errors.date = t('validation.date.required');
    }

    // Location validation
    if (!values.location) {
      errors.location = t('validation.location.required');
    } else if (values.location.length < 2) {
      errors.location = t('validation.location.min', { min: 2 });
    }

    return errors;
  };

  const handleSubmit = (values: EventFormValues) => {
    console.log('Form submitted:', values);
    // TODO: Implement form submission
  };

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Box mb={3}>
        <Typography variant="h2" gutterBottom>
          {t('sections.event-details')}
        </Typography>
      </Box>

      <Formik initialValues={initialValues} validate={validate} onSubmit={handleSubmit}>
        {() => (
          <Form>
            <Stack spacing={3}>
              <Grid container spacing={3}>
                <Grid size={6}>
                  <FormikTextField
                    name="name"
                    label={t('fields.name.label')}
                    placeholder={t('fields.name.placeholder')}
                  />
                </Grid>

                <Grid size={6}>
                  <FormikTextField
                    name="slug"
                    label={t('fields.slug.label')}
                    placeholder={t('fields.slug.placeholder')}
                    helperText={t('fields.slug.helper-text')}
                  />
                </Grid>

                <Grid size={6}>
                  <FormikDatePicker name="date" label={t('fields.date.label')} />
                </Grid>

                <Grid size={6}>
                  <FormikTextField
                    name="location"
                    label={t('fields.location.label')}
                    placeholder={t('fields.location.placeholder')}
                  />
                </Grid>
              </Grid>
            </Stack>
          </Form>
        )}
      </Formik>
    </Paper>
  );
};
