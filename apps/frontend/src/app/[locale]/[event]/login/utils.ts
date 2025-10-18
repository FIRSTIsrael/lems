import { LoginFormValues, LoginStep } from './types';

/**
 * Validate form values based on the current step
 */
export const validateForm = (values: LoginFormValues, currentStep: LoginStep) => {
  const errors: Partial<LoginFormValues> = {};

  switch (currentStep) {
    case LoginStep.Role:
      if (!values.role) {
        errors.role = 'required';
      }
      break;
    default:
      break;
  }

  return errors;
};
