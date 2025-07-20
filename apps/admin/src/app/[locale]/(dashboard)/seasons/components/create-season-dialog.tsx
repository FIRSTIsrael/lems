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
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { FileUpload } from '@lems/shared';
import { AdminSeasonResponseSchema } from '@lems/backend/schemas';
import { apiFetch } from '../../../../../../lib/fetch';

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

const CreationForm: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(
    null
  );

  const initialValues: SeasonFormValues = {
    slug: '',
    name: '',
    startDate: dayjs().startOf('year'),
    endDate: dayjs().endOf('year')
  };

  const validateForm = (values: SeasonFormValues): SeasonFormErrors => {
    const errors: SeasonFormErrors = {};

    if (!values.slug?.trim()) {
      errors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(values.slug)) {
      errors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
    }

    if (!values.name?.trim()) {
      errors.name = 'Name is required';
    }

    if (!values.startDate) {
      errors.startDate = 'Start date is required';
    }

    if (!values.endDate) {
      errors.endDate = 'End date is required';
    }

    if (values.startDate && values.endDate && values.startDate.isAfter(values.endDate)) {
      errors.endDate = 'End date must be after start date';
    }

    return errors;
  };

  const handleSubmit = async (
    values: SeasonFormValues,
    { setSubmitting, setStatus }: FormikHelpers<SeasonFormValues>
  ) => {
    setIsSubmitting(true);
    setStatus(null);
    setSubmitResult(null);

    try {
      // Create FormData for multipart/form-data request
      const formData = new FormData();
      formData.append('slug', values.slug);
      formData.append('name', values.name);
      formData.append('startDate', values.startDate!.toISOString());
      formData.append('endDate', values.endDate!.toISOString());

      if (selectedFile) {
        formData.append('logo', selectedFile);
      }

      const { response, data } = await apiFetch(
        '/admin/seasons',
        {
          method: 'POST',
          body: formData
        },
        AdminSeasonResponseSchema
      );

      if (response.ok) {
        setSubmitResult({
          success: true,
          message: `Season "${values.name}" created successfully with ID: ${data.id}`
        });

        // Reset form
        setSelectedFile(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Season creation error:', error);
      setSubmitResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create season'
      });
      setStatus(error instanceof Error ? error.message : 'Failed to create season');
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Formik
        initialValues={initialValues}
        validate={validateForm}
        onSubmit={handleSubmit}
        validateOnMount
      >
        {({ values, errors, touched, setFieldValue, isValid, status }) => (
          <Form>
            <Stack spacing={3}>
              <TextField
                name="slug"
                label="Slug"
                value={values.slug}
                onChange={e => setFieldValue('slug', e.target.value)}
                error={touched.slug && !!errors.slug}
                helperText={touched.slug && errors.slug}
                placeholder="e.g., submerged"
                fullWidth
                disabled={isSubmitting}
              />

              <TextField
                name="name"
                label="Season Name"
                value={values.name}
                onChange={e => setFieldValue('name', e.target.value)}
                error={touched.name && !!errors.name}
                helperText={touched.name && errors.name}
                placeholder="e.g., SUBMERGED 2024-2025"
                fullWidth
                disabled={isSubmitting}
              />

              <Stack direction="row" spacing={2}>
                <DatePicker
                  label="Start Date"
                  value={values.startDate}
                  onChange={newDate => setFieldValue('startDate', newDate)}
                  slotProps={{
                    textField: {
                      error: touched.startDate && !!errors.startDate,
                      helperText: touched.startDate && errors.startDate,
                      fullWidth: true,
                      disabled: isSubmitting
                    }
                  }}
                />

                <DatePicker
                  label="End Date"
                  value={values.endDate}
                  onChange={newDate => setFieldValue('endDate', newDate)}
                  slotProps={{
                    textField: {
                      error: touched.endDate && !!errors.endDate,
                      helperText: touched.endDate && errors.endDate,
                      fullWidth: true,
                      disabled: isSubmitting
                    }
                  }}
                />
              </Stack>

              <FileUpload
                label="Logo"
                accept=".svg,image/svg+xml"
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                description="Upload a logo in SVG format"
                disabled={isSubmitting}
                placeholder="Accepts files in SVG format"
              />

              {status && <Alert severity="error">{status}</Alert>}

              <Stack direction="row" justifyContent="center" spacing={2}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                  disabled={!isValid || isSubmitting}
                  sx={{ minWidth: 200 }}
                >
                  {isSubmitting ? 'Creating Season...' : 'Create Season'}
                </Button>
              </Stack>
            </Stack>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

// I want the hide prop to be passed from the dialog provider
// when this component is set as the dialog component.
export const CreateSeasonDialog: React.FC = ({ hide }) => {
  return (
    <>
      <DialogTitle>Season Creator</DialogTitle>
      <DialogContent>
        <CreationForm onSubmit={hide} />
      </DialogContent>
      <DialogActions>
        <Button onClick={hideDialog}>Cancel</Button>
      </DialogActions>
    </>
  );
};
