'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form, FormikHelpers } from 'formik';
import { Stack, Box, Alert, alpha, Fade } from '@mui/material';
import { useRoleTranslations } from '@lems/localization';
import { createRecaptchaToken, removeRecaptchaBadge } from '@lems/shared';
import { LoginFormValues, LoginStep } from '../types';
import { validateForm, submitLogin } from '../utils';
import { RoleStep } from './steps/role-step';
import { DivisionStep } from './steps/division-step';
import { RoleInfoStep } from './steps/role-info-step';
import { UserStep } from './steps/user-step';
import { PasswordStep } from './steps/password-step';
import { StepIndicator } from './step-indicator';
import { CompletedStepSummary } from './step-summaries/completed-step-summary';
import { CompletedDivisionStepSummary } from './step-summaries/completed-division-step-summary';
import { CompletedUserStepSummary } from './step-summaries/completed-user-step-summary';
import { useVolunteer } from './volunteer-context';

const initialValues: LoginFormValues = {
  currentStep: LoginStep.Role,
  role: '',
  divisionId: '',
  roleInfoValue: { id: '', name: '' },
  userId: '',
  password: ''
};

interface LoginFormProps {
  recaptchaRequired: boolean;
}

export function LoginForm({ recaptchaRequired }: LoginFormProps) {
  const t = useTranslations('pages.login');
  const router = useRouter();
  const { getRole } = useRoleTranslations();
  const { needsDivision, needsRoleInfo, needsUser, volunteerData } = useVolunteer();

  const [disableAfterSuccess, setDisableAfterSuccess] = useState(false);

  function renderStep(currentStep: LoginStep) {
    switch (currentStep) {
      case LoginStep.Role:
        return <RoleStep />;
      case LoginStep.Division:
        return <DivisionStep />;
      case LoginStep.RoleInfo:
        return <RoleInfoStep />;
      case LoginStep.User:
        return <UserStep />;
      case LoginStep.Password:
        return <PasswordStep disableAfterSuccess={disableAfterSuccess} />;
      default:
        return null;
    }
  }

  const handleSubmit = async (
    values: LoginFormValues,
    { setStatus }: FormikHelpers<LoginFormValues>
  ) => {
    setStatus(null);

    try {
      const captchaToken = recaptchaRequired ? await createRecaptchaToken() : undefined;
      await submitLogin(values, volunteerData, captchaToken);

      removeRecaptchaBadge();
      setLockAfterSuccess(true); // keep disabled after success

      router.push(`/lems/${values.role}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'server-error';
      setStatus(message);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validate={values => validateForm(values, values.currentStep)}
      validateOnMount
      enableReinitialize
    >
      {({ status, values, setFieldValue, setStatus }) => {
        const availableSteps = [LoginStep.Role];

        if (values.currentStep > LoginStep.Role) {
          if (needsDivision) availableSteps.push(LoginStep.Division);
          if (needsRoleInfo) availableSteps.push(LoginStep.RoleInfo);
          if (needsUser(values.divisionId)) availableSteps.push(LoginStep.User);
          availableSteps.push(LoginStep.Password);
        }

        const completedSteps = availableSteps.filter(step => step < values.currentStep);

        const handleStepClick = (targetStep: LoginStep) => {
          setFieldValue('currentStep', targetStep);
          setStatus(null);

          setFieldValue('password', '');
          if (targetStep < LoginStep.Division) setFieldValue('divisionId', '');
          if (targetStep < LoginStep.RoleInfo) setFieldValue('roleInfoValue', { id: '', name: '' });
          if (targetStep < LoginStep.User) setFieldValue('userId', '');
        };

        return (
          <Form>
            <Stack direction="column" spacing={3}>
              <Box display={{ xs: 'none', md: 'block' }}>
                <StepIndicator
                  currentStep={values.currentStep}
                  completedSteps={completedSteps}
                  availableSteps={availableSteps}
                />
              </Box>

              <Box>
                {values.role && values.currentStep > LoginStep.Role && (
                  <CompletedStepSummary
                    label={t('fields.role')}
                    value={getRole(values.role)}
                    onStepClick={() => handleStepClick(LoginStep.Role)}
                  />
                )}
                {needsDivision && values.currentStep > LoginStep.Division && (
                  <CompletedDivisionStepSummary
                    divisionId={values.divisionId}
                    label={t('fields.division')}
                    onStepClick={() => handleStepClick(LoginStep.Division)}
                  />
                )}
                {needsRoleInfo && values.currentStep > LoginStep.RoleInfo && (
                  <CompletedStepSummary
                    label={t('fields.association')}
                    value={values.roleInfoValue.name}
                    onStepClick={() => handleStepClick(LoginStep.RoleInfo)}
                  />
                )}
                {needsUser(values.divisionId) && values.currentStep > LoginStep.User && (
                  <CompletedUserStepSummary
                    userId={values.userId}
                    label={t('fields.user')}
                    onStepClick={() => handleStepClick(LoginStep.User)}
                  />
                )}
              </Box>

              <Fade in timeout={500}>
                <Box>{renderStep(values.currentStep)}</Box>
              </Fade>

              {status && (
                <Fade in timeout={300}>
                  <Alert
                    severity="error"
                    sx={{
                      borderRadius: 2,
                      background: theme =>
                        `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.05)} 0%, ${alpha(theme.palette.error.light, 0.08)} 100%)`
                    }}
                  >
                    {t(`errors.${status}`)}
                  </Alert>
                </Fade>
              )}
            </Stack>
          </Form>
        );
      }}
    </Formik>
  );
}
