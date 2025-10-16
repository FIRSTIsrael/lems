'use client';

import { useFormikContext } from 'formik';
import { Stack } from '@mui/material';
import { LoginStep, LoginFormValues } from '../types';
import { RoleStep } from './steps/role-step';
import { DivisionStep } from './steps/division-step';
import { AssociationStep } from './steps/association-step';
import { UserStep } from './steps/user-step';
import { PasswordStep } from './steps/password-step';

interface CurrentLoginStepProps {
  currentStep: LoginStep;
}

export function CurrentLoginStep({ currentStep }: CurrentLoginStepProps) {
  const { values, isSubmitting, setFieldValue } = useFormikContext<LoginFormValues>();

  const renderStepContent = () => {
    switch (currentStep) {
      case 'role':
        return (
          <RoleStep
            value={values.role}
            isSubmitting={isSubmitting}
            onChange={value => setFieldValue('role', value)}
          />
        );

      case 'division':
        return (
          <DivisionStep
            value={values.divisionId}
            isSubmitting={isSubmitting}
            onChange={value => setFieldValue('divisionId', value)}
          />
        );

      case 'association':
        return (
          <AssociationStep
            value={values.associationValue}
            isSubmitting={isSubmitting}
            onChange={value => setFieldValue('associationValue', value)}
          />
        );

      case 'user':
        return (
          <UserStep
            value={values.userId}
            isSubmitting={isSubmitting}
            onChange={value => setFieldValue('userId', value)}
          />
        );

      case 'password':
        return <PasswordStep isSubmitting={isSubmitting} />;

      default:
        return null;
    }
  };

  return (
    <Stack direction="column" spacing={3}>
      {renderStepContent()}
    </Stack>
  );
}
