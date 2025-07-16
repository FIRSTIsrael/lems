import DOMPurify from 'dompurify';
import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import { Formik, Form, FormikHelpers } from 'formik';
import {
  Button,
  Typography,
  Stack,
  Paper,
  IconButton,
  InputAdornment,
  Container
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { ChevronEndIcon } from '@lems/localization';
import { FormikTextField } from '@lems/shared';
import { apiFetch } from '../lib/utils/fetch';
import { useRecaptcha, createRecaptchaToken, removeRecaptchaBadge } from '@lems/shared';
import { getMessages } from '../locale/get-messages';

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
      let returnUrl = '/';
      if (router.query.returnUrl) {
        returnUrl = Array.isArray(router.query.returnUrl)
          ? router.query.returnUrl[0]
          : router.query.returnUrl;
      }
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
                  disabled={isSubmitting}
                  autoComplete="username"
                  required
                />

                <FormikTextField
                  name="password"
                  variant="outlined"
                  type={showPassword ? 'text' : 'password'}
                  label={t('password')}
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
                  endIcon={<ChevronEndIcon />}
                  sx={{ borderRadius: 2, py: 1.5 }}
                >
                  {isSubmitting ? t('logging-in') : t('login')}
                </Button>

                {status && (
                  <Typography color="error" variant="body2">
                    {t(status)}
                  </Typography>
                )}
              </Stack>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const response = await apiFetch('/admin/auth/verify', undefined, ctx);

  console.log('Login page verification response:', response.status);

  if (response.ok) {
    // User is already logged in, redirect to homepage
    console.log('User is already logged in, redirecting to homepage');
    return { redirect: { destination: '/', permanent: false } };
  }

  const recaptchaRequired = process.env.RECAPTCHA === 'true';
  const messages = await getMessages(ctx.locale);
  return { props: { recaptchaRequired, messages } };
};

export default Page;
