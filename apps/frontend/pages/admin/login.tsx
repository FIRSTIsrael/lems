import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { Formik, Form, FormikHelpers } from 'formik';
import { Button, Typography, Stack, Paper, IconButton, InputAdornment } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Layout from '../../components/layout';
import FormikTextField from '../../components/formik/formik-text-field';
import { apiFetch } from '../../lib/utils/fetch';
import {
  useRecaptcha,
  createRecaptchaToken,
  removeRecaptchaBadge
} from '../../hooks/use-recaptcha';

interface LoginFormValues {
  username: string;
  password: string;
}

interface PageProps {
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

const Page: NextPage<PageProps> = ({ recaptchaRequired }) => {
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
      const response = await apiFetch('/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, captchaToken })
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('too-many-requests');
        }
        if (response.status === 401) {
          throw new Error('invalid-credentials');
        }
        throw new Error('server-error');
      }

      removeRecaptchaBadge();
      let returnUrl = '/admin';
      if (router.query.returnUrl) {
        returnUrl = Array.isArray(router.query.returnUrl)
          ? router.query.returnUrl[0]
          : router.query.returnUrl;
      }
      if (!returnUrl.startsWith('/admin')) {
        returnUrl = '/admin';
      }
      router.push(returnUrl as string);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'server-error';
      setStatus(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout maxWidth="sm">
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
                  התחברות למערכת
                </Typography>

                <FormikTextField
                  name="username"
                  variant="outlined"
                  label="שם משתמש"
                  disabled={isSubmitting}
                  autoComplete="username"
                  required
                />

                <FormikTextField
                  name="password"
                  variant="outlined"
                  type={showPassword ? 'text' : 'password'}
                  label="סיסמה"
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
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  }}
                />

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isSubmitting || !isValid}
                  endIcon={<ChevronLeftIcon />}
                  sx={{ borderRadius: 2, py: 1.5 }}
                >
                  {isSubmitting ? 'מתחבר...' : 'התחבר'}
                </Button>

                {status && (
                  <Typography color="error" variant="body2">
                    {status}
                  </Typography>
                )}
              </Stack>
            </Form>
          )}
        </Formik>
      </Paper>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const response = await apiFetch('/admin/auth/verify', undefined, ctx);
  if (response.ok) {
    // User is already logged in, redirect to admin page
    return { redirect: { destination: '/admin', permanent: false } };
  }

  const recaptchaRequired = process.env.RECAPTCHA === 'true';
  return { props: { recaptchaRequired } };
};

export default Page;
