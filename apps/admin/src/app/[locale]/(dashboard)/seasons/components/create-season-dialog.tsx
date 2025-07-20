'use client';

import React, { useState } from 'react';
import { Formik, Form, FormikHelpers } from 'formik';
import dayjs, { Dayjs } from 'dayjs';
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
import { DatePicker } from '@mui/x-date-pickers';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { FileUpload } from '@lems/shared';
import { AdminSeasonResponseSchema } from '@lems/backend/schemas';
import { FormikTextField } from '@lems/shared';
import { apiFetch } from '@lems/admin/lib/fetch';
import { DialogComponentProps } from '../../dialog-provider';
import { useTranslations } from 'next-intl';

interface SeasonFormValues {
  slug: string;
  name: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
}

interface SeasonFormErrors {
  slug?: string;
  name?: string;
  startDate?: string;
  endDate?: string;
}

interface CreationFormProps {
  onSuccess?: () => void;
}

const CreationForm: React.FC<CreationFormProps> = ({ onSuccess }) => {
  const t = useTranslations('pages.seasons.creation-dialog.form');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const initialValues: SeasonFormValues = {
    slug: '',
    name: '',
    startDate: dayjs().startOf('year'),
    endDate: dayjs().endOf('year')
  };

  const validateForm = (values: SeasonFormValues): SeasonFormErrors => {
    const errors: SeasonFormErrors = {};

    if (!values.slug?.trim()) {
      errors.slug = 'slug-required';
    } else if (!/^[a-z0-9-]+$/.test(values.slug)) {
      errors.slug = 'slug-invalid';
    }

    if (!values.name?.trim()) {
      errors.name = 'name-required';
    }

    if (!values.startDate) {
      errors.startDate = 'start-date-required';
    }

    if (!values.endDate) {
      errors.endDate = 'end-date-required';
    }

    if (values.startDate && values.endDate && values.startDate.isAfter(values.endDate)) {
      errors.endDate = 'end-date-invalid';
    }

    return errors;
  };

  const handleSubmit = async (
    values: SeasonFormValues,
    { setSubmitting, setStatus }: FormikHelpers<SeasonFormValues>
  ) => {
    setSubmitting(true);
    setStatus(null);

    try {
      const formData = new FormData();
      formData.append('slug', values.slug);
      formData.append('name', values.name);
      formData.append('startDate', values.startDate!.toISOString());
      formData.append('endDate', values.endDate!.toISOString());

      if (selectedFile) {
        formData.append('logo', selectedFile);
      }

      const result = await apiFetch(
        '/admin/seasons',
        {
          method: 'POST',
          body: formData
        },
        AdminSeasonResponseSchema
      );

      if (result.ok) {
        setSelectedFile(null);
        onSuccess?.();
      } else {
        throw new Error();
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
        {({ values, errors, touched, setFieldValue, isValid, status, isSubmitting }) => (
          <Form>
            <Stack spacing={3}>
              <FormikTextField
                name="slug"
                label={t('fields.slug.label')}
                error={touched.slug && !!errors.slug}
                helperText={touched.slug && errors.slug ? t(`errors.${errors.slug}`) : undefined}
                placeholder={t('fields.slug.placeholder')}
                fullWidth
                disabled={isSubmitting}
              />

              <FormikTextField
                name="name"
                label={t('fields.name.label')}
                error={touched.name && !!errors.name}
                helperText={touched.name && errors.name ? t(`errors.${errors.name}`) : undefined}
                placeholder={t('fields.name.placeholder')}
                fullWidth
                disabled={isSubmitting}
              />

              <Stack direction="row" spacing={2}>
                <DatePicker
                  label={t('fields.start-date.label')}
                  value={values.startDate}
                  onChange={newDate => setFieldValue('startDate', newDate)}
                  slotProps={{
                    textField: {
                      error: touched.startDate && !!errors.startDate,
                      helperText:
                        touched.startDate && errors.startDate
                          ? t(`errors.${errors.startDate}`)
                          : undefined,
                      fullWidth: true,
                      disabled: isSubmitting
                    }
                  }}
                />

                <DatePicker
                  label={t('fields.end-date.label')}
                  value={values.endDate}
                  onChange={newDate => setFieldValue('endDate', newDate)}
                  slotProps={{
                    textField: {
                      error: touched.endDate && !!errors.endDate,
                      helperText:
                        touched.endDate && errors.endDate
                          ? t(`errors.${errors.endDate}`)
                          : undefined,
                      fullWidth: true,
                      disabled: isSubmitting
                    }
                  }}
                />
              </Stack>

              <FileUpload
                label={t('fields.logo.label')}
                accept=".svg,image/svg+xml"
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
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : <CloudUploadIcon />}
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

export const CreateSeasonDialog: React.FC<DialogComponentProps> = ({ close }) => {
  const t = useTranslations('pages.seasons.creation-dialog');

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
