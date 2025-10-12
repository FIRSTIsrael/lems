'use client';

import { useTranslations } from 'next-intl';
import { Formik, Form } from 'formik';
import { Typography, Stack, Paper, Container, Box, Alert, CircularProgress } from '@mui/material';
import { LoginFormProps, LoginFormValues } from './types';
import { getStepIndex, getActiveSteps, validateForm } from './utils';
import { useLoginFlow } from './hooks/use-login-flow';
import { LoginStepper, LoginStepContent, SubmitButton } from './components';

const initialValues: LoginFormValues = {
  role: '',
  divisionId: '',
  associationValue: '',
  userId: '',
  password: ''
};

export function LoginForm({ eventSlug, recaptchaRequired }: LoginFormProps) {
  const t = useTranslations('pages.login');
  const { currentStep, isLoading, handleSubmit } = useLoginFlow(eventSlug, recaptchaRequired);

  const activeSteps = getActiveSteps(currentStep);
  const currentStepIndex = getStepIndex(currentStep.step);

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h2" textAlign="center" sx={{ mb: 3 }}>
          {t('title')}
        </Typography>

        {isLoading && currentStep.step === 'initial' ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <LoginStepper activeSteps={activeSteps} currentStepIndex={currentStepIndex} />

            <Formik
              initialValues={initialValues}
              onSubmit={handleSubmit}
              validate={values => validateForm(values, currentStep)}
              validateOnMount
              enableReinitialize
            >
              {({ isSubmitting, status, isValid, values, setFieldValue }) => (
                <Form>
                  <Stack direction="column" spacing={3}>
                    <LoginStepContent
                      currentStep={currentStep}
                      values={values}
                      isSubmitting={isSubmitting}
                      onFieldChange={(field, value) => setFieldValue(field, value)}
                    />

                    <SubmitButton
                      isSubmitting={isSubmitting}
                      isValid={isValid}
                      isLoading={isLoading}
                    />

                    {status && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        {t(`errors.${status}`)}
                      </Alert>
                    )}
                  </Stack>
                </Form>
              )}
            </Formik>
          </>
        )}
      </Paper>
    </Container>
  );
}
