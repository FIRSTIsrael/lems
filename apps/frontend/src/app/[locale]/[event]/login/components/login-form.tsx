'use client';

import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { Formik, Form } from 'formik';
import { Typography, Stack, Paper, Container, Box, Alert, CircularProgress } from '@mui/material';
import { useRecaptcha } from '@lems/shared';
import { LoginFormValues, LoginStep } from '../types';
import { validateForm } from '../utils';
import { RoleStep } from './steps/role-step';
import { NextStepButton } from './next-step-button';

const initialValues: LoginFormValues = {
  currentStep: LoginStep.Role,
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

  function renderStep(currentStep: LoginStep) {
    switch (currentStep) {
      case LoginStep.Role:
        return <RoleStep />;
      default:
        return null;
    }
  }

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, mt: 4 }}>
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
            validate={values => validateForm(values, values.currentStep)}
            validateOnMount
            enableReinitialize
          >
            {({ status, values }) => (
              <Form>
                <Stack direction="column" spacing={3}>
                  {renderStep(values.currentStep)}

                  <NextStepButton />

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
