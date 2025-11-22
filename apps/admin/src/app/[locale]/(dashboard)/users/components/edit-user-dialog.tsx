'use client';

import { useState } from 'react';
import { Formik, Form, FormikHelpers } from 'formik';
import { useTranslations } from 'next-intl';
import { mutate } from 'swr';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Stack,
  Alert,
  Divider,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { ExpandMore, Save } from '@mui/icons-material';
import { FormikTextField, apiFetch } from '@lems/shared';
import { AdminUser } from '@lems/types/api/admin';
import { PasswordField, validatePassword } from './password-field';

interface EditUserDialogProps {
  open: boolean;
  onClose: () => void;
  user: AdminUser;
}

interface ProfileFormValues {
  firstName: string;
  lastName: string;
}

interface PasswordFormValues {
  password: string;
}

interface ProfileFormErrors {
  firstName?: string;
  lastName?: string;
}

interface PasswordFormErrors {
  password?: string;
}

export const EditUserDialog: React.FC<EditUserDialogProps> = ({ open, onClose, user }) => {
  const t = useTranslations('pages.users.edit');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const profileInitialValues: ProfileFormValues = {
    firstName: user.firstName,
    lastName: user.lastName
  };

  const passwordInitialValues: PasswordFormValues = {
    password: ''
  };

  const validateProfileForm = (values: ProfileFormValues): ProfileFormErrors => {
    const errors: ProfileFormErrors = {};

    if (!values.firstName?.trim()) {
      errors.firstName = 'first-name-required';
    }

    if (!values.lastName?.trim()) {
      errors.lastName = 'last-name-required';
    }

    return errors;
  };

  const validatePasswordForm = (values: PasswordFormValues): PasswordFormErrors => {
    const errors: PasswordFormErrors = {};

    if (!values.password?.trim()) {
      errors.password = 'password-required';
    } else {
      const passwordValidation = validatePassword(values.password);
      const isPasswordValid = Object.values(passwordValidation).every(Boolean);
      if (!isPasswordValid) {
        errors.password = 'password-invalid';
      }
    }

    return errors;
  };

  const handleProfileSubmit = async (
    values: ProfileFormValues,
    { setSubmitting }: FormikHelpers<ProfileFormValues>
  ) => {
    setSubmitting(true);
    setProfileError(null);

    try {
      const result = await apiFetch(`/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      if (result.ok) {
        mutate('/admin/users');
        onClose();
      } else {
        throw new Error('Failed to update user profile');
      }
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Failed to update user profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (
    values: PasswordFormValues,
    { setSubmitting, resetForm }: FormikHelpers<PasswordFormValues>
  ) => {
    setSubmitting(true);
    setPasswordError(null);

    try {
      const result = await apiFetch(`/admin/users/${user.id}/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      if (result.ok) {
        resetForm();
        setPasswordError(null);
        // Show success message or close dialog
      } else {
        throw new Error('Failed to update password');
      }
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Failed to update password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setProfileError(null);
    setPasswordError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('title', { userName: `${user.firstName} ${user.lastName}` })}</DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          {/* Profile Section */}
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('profile.title')}
            </Typography>
            <Formik
              initialValues={profileInitialValues}
              validate={validateProfileForm}
              onSubmit={handleProfileSubmit}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2}>
                      <FormikTextField
                        name="firstName"
                        label={t('profile.fields.first-name.label')}
                        error={touched.firstName && !!errors.firstName}
                        helperText={
                          touched.firstName && errors.firstName
                            ? t(`profile.errors.${errors.firstName}`)
                            : undefined
                        }
                        fullWidth
                        disabled={isSubmitting}
                      />
                      <FormikTextField
                        name="lastName"
                        label={t('profile.fields.last-name.label')}
                        error={touched.lastName && !!errors.lastName}
                        helperText={
                          touched.lastName && errors.lastName
                            ? t(`profile.errors.${errors.lastName}`)
                            : undefined
                        }
                        fullWidth
                        disabled={isSubmitting}
                      />
                    </Stack>

                    {profileError && <Alert severity="error">{profileError}</Alert>}

                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<Save />}
                      disabled={isSubmitting}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      {isSubmitting ? t('profile.submitting') : t('profile.submit')}
                    </Button>
                  </Stack>
                </Form>
              )}
            </Formik>
          </Box>

          <Divider />

          <Box>
            <Accordion variant="outlined">
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">{t('password.title')}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Formik
                  initialValues={passwordInitialValues}
                  validate={validatePasswordForm}
                  onSubmit={handlePasswordSubmit}
                >
                  {({ errors, touched, isSubmitting, values }) => (
                    <Form>
                      <Stack spacing={2}>
                        <PasswordField
                          name="password"
                          label={t('password.fields.password.label')}
                          placeholder={t('password.fields.password.placeholder')}
                          disabled={isSubmitting}
                          touched={touched.password}
                          error={errors.password}
                          value={values.password}
                        />

                        {passwordError && <Alert severity="error">{passwordError}</Alert>}

                        <Button
                          type="submit"
                          variant="outlined"
                          startIcon={<Save />}
                          disabled={isSubmitting}
                          sx={{ alignSelf: 'flex-start' }}
                        >
                          {isSubmitting ? t('password.submitting') : t('password.submit')}
                        </Button>
                      </Stack>
                    </Form>
                  )}
                </Formik>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('cancel')}</Button>
      </DialogActions>
    </Dialog>
  );
};
