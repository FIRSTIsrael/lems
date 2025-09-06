'use client';

import DOMPurify from 'dompurify';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Formik, Form, FormikHelpers } from 'formik';
import {
  Button,
  Typography,
  Stack,
  Paper,
  IconButton,
  InputAdornment,
  Container,
  Box
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { ChevronEndIcon } from '@lems/localization';
import {
  useRecaptcha,
  createRecaptchaToken,
  removeRecaptchaBadge,
  FormikTextField
} from '@lems/shared';
import { apiFetch } from '../../../lib/fetch';

interface LoginFormValues {
  username: string;
  password: string;
}

interface LoginFormProps {
  recaptchaRequired: boolean;
}

const validateForm = (values: LoginFormValues) => {
  const errors: Partial<LoginFormValues> = {};

  if (!values.username.trim()) {
    errors.username = 'no-username';
  }

  if (!values.password) {
    errors.password = 'no-password';
  }

  return errors;
};

export function LoginForm({ recaptchaRequired }: LoginFormProps) {
  const t = useTranslations('pages.login');
  const router = useRouter();
  useRecaptcha(recaptchaRequired);

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const initialValues: LoginFormValues = {
    username: '',
    password: ''
  };

  const handleSubmit = async (
    values: LoginFormValues,
    { setSubmitting, setStatus }: FormikHelpers<LoginFormValues>
  ) => {
    setStatus(null);
    setSubmitting(true);

    try {
      const captchaToken = recaptchaRequired ? await createRecaptchaToken() : undefined;

      const result = await apiFetch('/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, captchaToken })
      });

      if (!result.ok) {
        if (result.status === 429) {
          throw new Error('too-many-requests');
        }
        if (result.status === 401) {
          throw new Error('invalid-credentials');
        }
        throw new Error('server-error');
      }

      removeRecaptchaBadge();

      const urlParams = new URLSearchParams(window.location.search);
      let returnUrl = urlParams.get('returnUrl') || '/';

      if (!returnUrl.startsWith('/')) {
        returnUrl = '/';
      } else {
        // Sanitize and encode the returnUrl
        returnUrl = DOMPurify.sanitize(returnUrl);
        returnUrl = encodeURIComponent(returnUrl);
      }
      router.push(decodeURIComponent(returnUrl));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'server-error';
      setStatus(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validate={validateForm}
          validateOnMount
        >
          {({ isSubmitting, status, isValid }) => (
            <Form>
              <Stack direction="column" spacing={3}>
                <Typography variant="h2" textAlign="center" sx={{ mb: 2 }}>
                  {t('title')}
                </Typography>

                <FormikTextField
                  name="username"
                  variant="outlined"
                  label={t('username')}
                  helperText={t('no-username')}
                  disabled={isSubmitting}
                  autoComplete="username"
                  required
                />

                <FormikTextField
                  name="password"
                  variant="outlined"
                  type={showPassword ? 'text' : 'password'}
                  label={t('password')}
                  helperText={t('no-password')}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                  required
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  }}
                />

                <Box display="flex" justifyContent="center" width="100%">
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isSubmitting || !isValid}
                    endIcon={<ChevronEndIcon />}
                    sx={{ borderRadius: 2, py: 1.5, width: '50%' }}
                  >
                    {isSubmitting ? t('logging-in') : t('login')}
                  </Button>
                </Box>

                {status && (
                  <Typography color="error" variant="body2">
                    {t(`form-status.${status}`)}
                  </Typography>
                )}
              </Stack>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
}
