import { Stack } from '@mui/material';
import { LoginStep } from '../types';
import { RoleStep } from './role-step';
import { DivisionStep } from './division-step';
import { AssociationStep } from './association-step';
import { UserStep } from './user-step';
import { PasswordStep } from './password-step';

interface LoginStepContentProps {
  currentStep: LoginStep;
  values: {
    role: string;
    divisionId: string;
    associationValue: string;
    userId: string;
  };
  isSubmitting: boolean;
  onFieldChange: (field: string, value: string) => void;
}

export function LoginStepContent({
  currentStep,
  values,
  isSubmitting,
  onFieldChange
}: LoginStepContentProps) {
  const renderStepContent = () => {
    switch (currentStep.step) {
      case 'role':
        if (!currentStep.roles) return null;
        return (
          <RoleStep
            roles={currentStep.roles}
            value={values.role}
            isSubmitting={isSubmitting}
            onChange={value => onFieldChange('role', value)}
          />
        );

      case 'division':
        if (!currentStep.divisions) return null;
        return (
          <DivisionStep
            divisions={currentStep.divisions}
            value={values.divisionId}
            isSubmitting={isSubmitting}
            onChange={value => onFieldChange('divisionId', value)}
          />
        );

      case 'association':
        if (!currentStep.associations) return null;
        return (
          <AssociationStep
            associations={currentStep.associations}
            value={values.associationValue}
            isSubmitting={isSubmitting}
            onChange={value => onFieldChange('associationValue', value)}
          />
        );

      case 'user':
        if (!currentStep.users) return null;
        return (
          <UserStep
            users={currentStep.users}
            value={values.userId}
            isSubmitting={isSubmitting}
            onChange={value => onFieldChange('userId', value)}
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
