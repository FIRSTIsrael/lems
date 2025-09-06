'use client';

import React, { useState } from 'react';
import { Formik, Form, FormikHelpers } from 'formik';
import { useTranslations } from 'next-intl';
import { mutate } from 'swr';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Stack,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { FileUpload, FormikTextField } from '@lems/shared';
import { AdminTeamResponseSchema } from '@lems/types/api/admin';
import { apiFetch } from '../../../../../lib/fetch';
import { DialogComponentProps } from '../../components/dialog-provider';

interface TeamFormValues {
  name: string;
  number: string;
  affiliation: string;
  city: string;
}

interface TeamFormErrors {
  name?: string;
  number?: string;
  affiliation?: string;
  city?: string;
}

interface CreationFormProps {
  onSuccess?: () => void;
}

const CreationForm: React.FC<CreationFormProps> = ({ onSuccess }) => {
  const t = useTranslations('pages.teams.creation-dialog.form');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const initialValues: TeamFormValues = {
    name: '',
    number: '',
    affiliation: '',
    city: ''
  };

  const validateForm = (values: TeamFormValues): TeamFormErrors => {
    const errors: TeamFormErrors = {};

    if (!values.name?.trim()) {
      errors.name = 'name-required';
    }

    if (!values.number?.trim()) {
      errors.number = 'number-required';
    } else if (!/^\d+$/.test(values.number)) {
      errors.number = 'number-invalid';
    }

    if (!values.affiliation?.trim()) {
      errors.affiliation = 'affiliation-required';
    }

    if (!values.city?.trim()) {
      errors.city = 'city-required';
    }

    return errors;
  };

  const handleSubmit = async (
    values: TeamFormValues,
    { setSubmitting, setStatus }: FormikHelpers<TeamFormValues>
  ) => {
    setSubmitting(true);
    setStatus(null);

    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('number', values.number);
      formData.append('affiliation', values.affiliation);
      formData.append('city', values.city);

      if (selectedFile) {
        formData.append('logo', selectedFile);
      }

      const result = await apiFetch(
        '/admin/teams',
        {
          method: 'POST',
          body: formData
        },
        AdminTeamResponseSchema
      );

      if (result.ok) {
        mutate('/admin/teams');
        setSelectedFile(null);
        onSuccess?.();
      } else {
        if (result.status === 400) {
          setStatus('error');
        } else if (result.status === 409) {
          setStatus('number-exists');
        } else {
          throw new Error();
        }
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Formik initialValues={initialValues} validate={validateForm} onSubmit={handleSubmit}>
        {({ errors, touched, status, isSubmitting }) => (
          <Form>
            <Stack spacing={3}>
              <FormikTextField
                name="name"
                label={t('fields.name.label')}
                error={touched.name && !!errors.name}
                helperText={touched.name && errors.name ? t(`errors.${errors.name}`) : undefined}
                placeholder={t('fields.name.placeholder')}
                fullWidth
                disabled={isSubmitting}
              />

              <FormikTextField
                name="number"
                label={t('fields.number.label')}
                error={touched.number && !!errors.number}
                helperText={
                  touched.number && errors.number ? t(`errors.${errors.number}`) : undefined
                }
                placeholder={t('fields.number.placeholder')}
                fullWidth
                disabled={isSubmitting}
              />

              <Stack direction="row" spacing={2}>
                <FormikTextField
                  name="affiliation"
                  label={t('fields.affiliation.label')}
                  error={touched.affiliation && !!errors.affiliation}
                  helperText={
                    touched.affiliation && errors.affiliation
                      ? t(`errors.${errors.affiliation}`)
                      : undefined
                  }
                  placeholder={t('fields.affiliation.placeholder')}
                  fullWidth
                  disabled={isSubmitting}
                />

                <FormikTextField
                  name="city"
                  label={t('fields.city.label')}
                  error={touched.city && !!errors.city}
                  helperText={touched.city && errors.city ? t(`errors.${errors.city}`) : undefined}
                  placeholder={t('fields.city.placeholder')}
                  fullWidth
                  disabled={isSubmitting}
                />
              </Stack>

              <FileUpload
                label={t('fields.logo.label')}
                accept=".jpg,.jpeg,.png,.svg,image/*"
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                description={t('fields.logo.description')}
                disabled={isSubmitting}
                placeholder={t('fields.logo.placeholder')}
              />

              {status && <Alert severity="error">{t(`errors.${status}`)}</Alert>}

              <Stack direction="row" justifyContent="center" spacing={2}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : <CloudUpload />}
                  loading={isSubmitting}
                  sx={{ minWidth: 200 }}
                >
                  {isSubmitting ? t('submitting') : t('submit')}
                </Button>
              </Stack>
            </Stack>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export const CreateTeamDialog: React.FC<DialogComponentProps> = ({ close }) => {
  const t = useTranslations('pages.teams.creation-dialog');

  return (
    <>
      <DialogTitle>{t('title')}</DialogTitle>
      <DialogContent>
        <CreationForm onSuccess={close} />
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>{t('actions.cancel')}</Button>
      </DialogActions>
    </>
  );
};
