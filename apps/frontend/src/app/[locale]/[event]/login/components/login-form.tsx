'use client';

import { useState, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { Formik, Form } from 'formik';
import { Typography, Stack, Paper, Container, Box, Alert, CircularProgress } from '@mui/material';
import { useRecaptcha } from '@lems/shared';
import { LoginFormValues, LoginStep } from '../types';
import { validateForm } from '../utils';
import { CurrentLoginStep } from './current-login-step';
import { SubmitButton } from './submit-button';

const initialValues: LoginFormValues = {
  role: '',
  divisionId: '',
  associationValue: '',
  userId: '',
  password: ''
};

interface LoginFormProps {
  event: { name: string; slug: string };
  recaptchaRequired: boolean;
}

export function LoginForm({ event, recaptchaRequired }: LoginFormProps) {
  const t = useTranslations('pages.login');
  useRecaptcha(recaptchaRequired);

  const [currentStep, setCurrentStep] = useState<LoginStep>('role');

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h1" textAlign="center" sx={{ mb: 3 }}>
          {t('title')}
        </Typography>

        <Typography variant="h2" textAlign="center" sx={{ mb: 3 }}>
          {event.name}
        </Typography>

        <Suspense
          fallback={
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
              <CircularProgress />
            </Box>
          }
        >
          <Formik
            initialValues={initialValues}
            onSubmit={() => console.log('Submit')}
            validate={values => validateForm(values, currentStep)}
            validateOnMount
            enableReinitialize
          >
            {({ isSubmitting, status, isValid }) => (
              <Form>
                <Stack direction="column" spacing={3}>
                  <CurrentLoginStep currentStep={currentStep} />

                  <SubmitButton isSubmitting={isSubmitting} isValid={isValid} />

                  {status && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {t(`errors.${status}`)}
                    </Alert>
                  )}
                </Stack>
              </Form>
            )}
          </Formik>
        </Suspense>
      </Paper>
    </Container>
  );
}
