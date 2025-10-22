'use client';

import React, { useEffect, useState } from 'react';
import { Formik, Form, FormikHelpers } from 'formik';
import { useTranslations } from 'next-intl';
import { mutate } from 'swr';
import {
  Box,
  Stack,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography
} from '@mui/material';
import { CloudUpload, DeleteForever, Edit } from '@mui/icons-material';
import { FileUpload, FormikTextField, apiFetch } from '@lems/shared';
import { AdminTeamResponseSchema } from '@lems/types/api/admin';

interface TeamFormValues {
  name: string;
  number: string;
  affiliation: string;
  city: string;
  region: string;
}

interface TeamFormErrors {
  name?: string;
  number?: string;
  affiliation?: string;
  city?: string;
  region?: string;
}

interface TeamFormProps {
  route: string;
  method: 'POST' | 'PUT';
  onSuccess?: () => void;
  team?: TeamFormValues & { logoUrl?: string };
  isEditing?: boolean;
}

export const TeamForm: React.FC<TeamFormProps> = ({
  onSuccess,
  team,
  isEditing,
  route,
  method
}) => {
  const t = useTranslations('pages.teams.team-form');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(team?.logoUrl ?? null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [logoModalOpen, setLogoModalOpen] = useState(false);

  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [selectedFile]);

  const initialValues: TeamFormValues = team ?? {
    name: '',
    number: '',
    affiliation: '',
    city: '',
    region: ''
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

    if (!values.region?.trim()) {
      errors.region = 'region-required';
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
      formData.append('region', values.region);

      if (selectedFile) formData.append('logo', selectedFile);
      if (removeLogo) formData.append('removeLogo', 'true');

      const result = await apiFetch(
        route,
        {
          method,
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
              <Stack direction="row" spacing={2}>
                <FormikTextField
                  name="number"
                  label={t('fields.number.label')}
                  error={touched.number && !!errors.number}
                  helperText={
                    touched.number && errors.number ? t(`errors.${errors.number}`) : undefined
                  }
                  placeholder={t('fields.number.placeholder')}
                  fullWidth
                  disabled={isEditing || isSubmitting}
                />

                <FormikTextField
                  name="region"
                  label={t('fields.region.label')}
                  error={touched.region && !!errors.region}
                  helperText={
                    touched.region && errors.region
                      ? t(`errors.${errors.region}`)
                      : t('fields.region.helper-text')
                  }
                  placeholder={t('fields.region.placeholder')}
                  fullWidth
                  disabled={isSubmitting}
                />
              </Stack>

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

              {previewUrl && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" mb={1}>
                    {t('logo-preview-title')}
                  </Typography>
                  <Box
                    sx={{
                      position: 'relative',
                      display: 'flex',
                      width: '100%',
                      maxWidth: 300,
                      maxHeight: 300,
                      borderRadius: 2,
                      mx: 'auto',
                      overflow: 'hidden',
                      boxShadow: 1,
                      cursor: 'pointer',
                      '&:hover .overlay': { opacity: 1 }
                    }}
                    onClick={() => setLogoModalOpen(true)}
                  >
                    <Box
                      component="img"
                      src={previewUrl}
                      alt="Team Logo Preview"
                      sx={{
                        display: 'block',
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                    />
                    <Box
                      className="overlay"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.3s'
                      }}
                    >
                      <Edit sx={{ color: '#fff', fontSize: 32 }} />
                    </Box>
                  </Box>

                  {/* Logo Edit Dialog */}
                  <Dialog
                    open={logoModalOpen}
                    onClose={() => setLogoModalOpen(false)}
                    maxWidth="xs"
                    fullWidth
                  >
                    <DialogTitle>{t('edit-logo')}</DialogTitle>
                    <DialogContent>
                      <Stack spacing={2} sx={{ mt: 1 }}>
                        <FileUpload
                          label={t('fields.logo.label')}
                          accept=".jpg,.jpeg,.png,.svg,image/*"
                          selectedFile={selectedFile}
                          setSelectedFile={file => {
                            setSelectedFile(file);
                            setRemoveLogo(false);
                            setLogoModalOpen(false);
                          }}
                          description={t('fields.logo.description')}
                          disabled={isSubmitting}
                          placeholder={t('fields.logo.placeholder')}
                        />
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteForever />}
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl(null);
                            setRemoveLogo(true);
                            setLogoModalOpen(false);
                          }}
                          disabled={isSubmitting}
                        >
                          {t('remove-logo')}
                        </Button>
                      </Stack>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={() => setLogoModalOpen(false)}>{t('close')}</Button>
                    </DialogActions>
                  </Dialog>
                </Box>
              )}

              {!previewUrl && (
                <FileUpload
                  label={t('fields.logo.label')}
                  accept=".jpg,.jpeg,.png,.svg,image/*"
                  selectedFile={selectedFile}
                  setSelectedFile={file => {
                    setSelectedFile(file);
                    setRemoveLogo(false);
                  }}
                  description={t('fields.logo.description')}
                  disabled={isSubmitting}
                  placeholder={t('fields.logo.placeholder')}
                />
              )}

              {removeLogo && !selectedFile && <Alert severity="info">{t('logo-removed')}</Alert>}
              {status && <Alert severity="error">{t(`errors.${status}`)}</Alert>}

              <Stack direction="row" justifyContent="center" spacing={2}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : <CloudUpload />}
                  loading={isSubmitting}
                  sx={{ minWidth: 200 }}
                >
                  {isSubmitting
                    ? isEditing
                      ? t('updating')
                      : t('submitting')
                    : isEditing
                      ? t('update')
                      : t('submit')}
                </Button>
              </Stack>
            </Stack>
          </Form>
        )}
      </Formik>
    </Box>
  );
};
