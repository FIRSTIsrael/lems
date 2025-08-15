'use client';

import { useTranslations } from 'next-intl';
import { Formik, Form, FormikErrors } from 'formik';
import { Paper, Typography, Box, Stack, IconButton, Button } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Add as AddIcon } from '@mui/icons-material';
import { FormikDatePicker, FormikTextField, ColorPicker } from '@lems/shared';
import { hsvaToHex, hexToHsva, HsvaColor } from '@uiw/react-color';
import { defaultColor } from '../../../../../../theme';
import { isValidSlug } from '../../utils';
import { DivisionItem } from './division-item';

interface Division {
  name: string;
  color: HsvaColor;
}

interface EventFormValues {
  name: string;
  slug: string;
  date: Date | null;
  location: string;
  divisions: Division[];
}

const initialValues: EventFormValues = {
  name: '',
  slug: '',
  date: null,
  location: '',
  divisions: [{ name: '', color: hexToHsva(defaultColor) }]
};

export const CreateEventLayout = () => {
  const t = useTranslations('pages.events.create.form');

  const validate = (values: EventFormValues): FormikErrors<EventFormValues> => {
    const errors: FormikErrors<EventFormValues> = {};

    if (!values.name) {
      errors.name = t('validation.name.required');
    } else if (values.name.length < 2) {
      errors.name = t('validation.name.min', { min: 2 });
    }

    if (!values.slug) {
      errors.slug = t('validation.slug.required');
    } else if (!isValidSlug(values.slug)) {
      errors.slug = t('validation.slug.format');
    }

    if (!values.date) {
      errors.date = t('validation.date.required');
    }

    if (!values.location) {
      errors.location = t('validation.location.required');
    } else if (values.location.length < 2) {
      errors.location = t('validation.location.min', { min: 2 });
    }

    if (values.divisions.length > 1) {
      const divisionErrors: Array<{ name?: string }> = [];
      let hasErrors = false;

      values.divisions.forEach((division, index) => {
        const divisionError: { name?: string } = {};

        if (!division.name) {
          divisionError.name = t('validation.division.name.required');
          hasErrors = true;
        } else if (division.name.length < 2) {
          divisionError.name = t('validation.division.name.min', { min: 2 });
          hasErrors = true;
        }

        divisionErrors[index] = divisionError;
      });

      if (hasErrors) {
        errors.divisions = divisionErrors as FormikErrors<Division>[];
      }
    }

    return errors;
  };

  const handleSubmit = (values: EventFormValues) => {
    const submissionData = {
      ...values,
      divisions: values.divisions.map(division => ({
        ...division,
        color: hsvaToHex(division.color) // Convert to hex string for backend
      }))
    };
    console.log('Form submitted:', submissionData);
  };

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Formik initialValues={initialValues} validate={validate} onSubmit={handleSubmit}>
        {({ values, setFieldValue }) => {
          const isMultipleDivisions = values.divisions.length > 1;

          const addDivision = () => {
            const newDivision: Division = {
              name: '',
              color: hexToHsva(defaultColor)
            };
            setFieldValue('divisions', [...values.divisions, newDivision]);
          };

          const removeDivision = (index: number) => {
            if (values.divisions.length > 1) {
              const newDivisions = values.divisions.filter((_, i) => i !== index);
              setFieldValue('divisions', newDivisions);
            }
          };

          const updateDivisionField = (
            index: number,
            field: keyof Division,
            value: string | HsvaColor
          ) => {
            const newDivisions = [...values.divisions];
            newDivisions[index] = { ...newDivisions[index], [field]: value };
            setFieldValue('divisions', newDivisions);
          };

          return (
            <>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="h2" gutterBottom>
                  {t('sections.event-details')}
                </Typography>
                {!isMultipleDivisions && (
                  <ColorPicker
                    value={values.divisions[0].color}
                    onChange={(hsvaColor: HsvaColor) => updateDivisionField(0, 'color', hsvaColor)}
                  >
                    <IconButton
                      sx={{
                        width: 32,
                        height: 32,
                        mt: -1.5,
                        backgroundColor: hsvaToHex(values.divisions[0].color),
                        '&:hover': {
                          backgroundColor: hsvaToHex(values.divisions[0].color),
                          opacity: 0.8,
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                      aria-label="Choose event color"
                    />
                  </ColorPicker>
                )}
              </Box>

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

                  {isMultipleDivisions && (
                    <Box mt={4}>
                      <Typography variant="h2" gutterBottom>
                        {t('sections.divisions')}
                      </Typography>

                      <Stack spacing={2}>
                        {values.divisions.map((division, index) => (
                          <DivisionItem
                            key={index}
                            division={division}
                            updateDivisionField={updateDivisionField}
                            removeDivision={removeDivision}
                            isRemovable={values.divisions.length > 1}
                            index={index}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  <Box mt={2}>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={addDivision}
                      variant="outlined"
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      {t('actions.add-division')}
                    </Button>
                  </Box>
                </Stack>
              </Form>
            </>
          );
        }}
      </Formik>
    </Paper>
  );
};
