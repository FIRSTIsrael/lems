'use client';

import React from 'react';
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
import { PersonAdd } from '@mui/icons-material';
import { FormikTextField, apiFetch } from '@lems/shared';
import { AdminUserResponseSchema } from '@lems/types/api/admin';
import { DialogComponentProps } from '../../components/dialog-provider';
import { PasswordField, validatePassword } from './password-field';

interface UserFormValues {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface UserFormErrors {
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}

interface CreationFormProps {
  onSuccess?: () => void;
}

const CreationForm: React.FC<CreationFormProps> = ({ onSuccess }) => {
  const t = useTranslations('pages.users.creation-dialog.form');

  const initialValues: UserFormValues = {
    username: '',
    password: '',
    firstName: '',
    lastName: ''
  };

  const validateForm = (values: UserFormValues): UserFormErrors => {
    const errors: UserFormErrors = {};

    if (!values.username?.trim()) {
      errors.username = 'username-required';
    } else if (values.username.length < 3) {
      errors.username = 'username-too-short';
    } else if (!/^[a-zA-Z0-9_]+$/.test(values.username)) {
      errors.username = 'username-invalid';
    }

    if (!values.password?.trim()) {
      errors.password = 'password-required';
    } else {
      const passwordValidation = validatePassword(values.password);
      const isPasswordValid = Object.values(passwordValidation).every(Boolean);
      if (!isPasswordValid) {
        errors.password = 'password-invalid';
      }
    }

    if (!values.firstName?.trim()) {
      errors.firstName = 'firstName-required';
    }

    if (!values.lastName?.trim()) {
      errors.lastName = 'lastName-required';
    }

    return errors;
  };

  const handleSubmit = async (
    values: UserFormValues,
    { setSubmitting, setStatus }: FormikHelpers<UserFormValues>
  ) => {
    setSubmitting(true);
    setStatus(null);

    try {
      const result = await apiFetch(
        '/admin/users/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(values)
        },
        AdminUserResponseSchema
      );

      if (result.ok) {
        mutate('/admin/users');
        onSuccess?.();
      } else {
        if (result.status === 400) {
          setStatus('error');
        } else if (result.status === 409) {
          setStatus('username-exists');
        } else {
          throw new Error('error');
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
        {({ errors, touched, status, isSubmitting, values }) => (
          <Form>
            <Stack spacing={3}>
              <Stack direction="row" spacing={2}>
                <FormikTextField
                  name="firstName"
                  label={t('fields.firstName.label')}
                  error={touched.firstName && !!errors.firstName}
                  helperText={
                    touched.firstName && errors.firstName
                      ? t(`errors.${errors.firstName}`)
                      : undefined
                  }
                  placeholder={t('fields.firstName.placeholder')}
                  fullWidth
                  disabled={isSubmitting}
                />

                <FormikTextField
                  name="lastName"
                  label={t('fields.lastName.label')}
                  error={touched.lastName && !!errors.lastName}
                  helperText={
                    touched.lastName && errors.lastName ? t(`errors.${errors.lastName}`) : undefined
                  }
                  placeholder={t('fields.lastName.placeholder')}
                  fullWidth
                  disabled={isSubmitting}
                />
              </Stack>

              <FormikTextField
                name="username"
                label={t('fields.username.label')}
                error={touched.username && !!errors.username}
                helperText={
                  touched.username && errors.username ? t(`errors.${errors.username}`) : undefined
                }
                placeholder={t('fields.username.placeholder')}
                fullWidth
                disabled={isSubmitting}
              />

              <PasswordField
                name="password"
                label={t('fields.password.label')}
                placeholder={t('fields.password.placeholder')}
                disabled={isSubmitting}
                touched={touched.password}
                error={errors.password}
                value={values.password}
              />

              {status && <Alert severity="error">{t(`errors.${status}`)}</Alert>}

              <Stack direction="row" justifyContent="center" spacing={2}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : <PersonAdd />}
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

export const CreateUserDialog: React.FC<DialogComponentProps> = ({ close }) => {
  const t = useTranslations('pages.users.creation-dialog');

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
