import { LoginFormValues, LoginStep } from './types';

export const validateForm = (values: LoginFormValues, currentStep: LoginStep) => {
  const errors: Partial<LoginFormValues> = {};

  switch (currentStep) {
    case LoginStep.Role:
      if (!values.role) {
        errors.role = 'required';
      }
      break;
    case LoginStep.Division:
      if (!values.divisionId) {
        errors.divisionId = 'required';
      }
      break;
    case LoginStep.RoleInfo:
      if (!values.associationValue) {
        errors.associationValue = 'required';
      }
      break;
    default:
      break;
  }

  return errors;
};
