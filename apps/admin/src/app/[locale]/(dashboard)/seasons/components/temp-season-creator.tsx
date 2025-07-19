'use client';

import React, { useState } from 'react';
import { Formik, Form, FormikHelpers } from 'formik';
import {
  Box,
  Typography,
  Stack,
  Paper,
  Button,
  TextField,
  Input,
  CircularProgress,
  Alert
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
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

interface TempFileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  disabled?: boolean;
}

const TempFileUpload: React.FC<TempFileUploadProps> = ({
  onFileSelect,
  selectedFile,
  disabled
}) => {
  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1 }}>
        Logo (SVG files only):
      </Typography>
      <label htmlFor="logo-upload">
        <Input
          id="logo-upload"
          type="file"
          slotProps={{
            input: {
              accept: '.svg,image/svg+xml',
              style: { display: 'none' }
            }
          }}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target?.files?.[0] || null;
            onFileSelect(file);
          }}
          disabled={disabled}
        />
        <Button
          variant="outlined"
          startIcon={<AttachFileIcon />}
          component="span"
          disabled={disabled}
          sx={{ width: '100%' }}
        >
          {selectedFile ? selectedFile.name : 'Choose SVG Logo File'}
        </Button>
      </label>
    </Box>
  );
};

export const TemporarySeasonCreator: React.FC = () => {
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

      const { response } = await apiFetch('/admin/seasons', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setSubmitResult({
          success: true,
          message: `Season "${values.name}" created successfully with ID: ${result.id}`
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
      <Typography variant="h4" sx={{ mb: 3 }}>
        Temporary Season Creation Utility
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        This is a temporary utility for creating seasons. The interface is functional but not styled
        or designed.
      </Typography>

      {submitResult && (
        <Alert severity={submitResult.success ? 'success' : 'error'} sx={{ mb: 3 }}>
          {submitResult.message}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
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
                  placeholder="e.g., 2024-2025"
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
                  placeholder="e.g., INTO ORBIT 2024-2025"
                  fullWidth
                  disabled={isSubmitting}
                />

                <LocalizationProvider dateAdapter={AdapterDayjs}>
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
                </LocalizationProvider>

                <TempFileUpload
                  onFileSelect={setSelectedFile}
                  selectedFile={selectedFile}
                  disabled={isSubmitting}
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
      </Paper>
    </Box>
  );
};
