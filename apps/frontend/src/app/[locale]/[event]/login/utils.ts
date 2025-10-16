import { LoginFormValues, LoginStep } from './types';

/**
 * Validate form values based on the current step
 */
export const validateForm = (values: LoginFormValues, currentStep: LoginStep) => {
  const errors: Partial<LoginFormValues> = {};

  switch (currentStep) {
    case 'role':
      if (!values.role) {
        errors.role = 'required';
      }
      break;
    case 'division':
    case 'association':
    case 'user':
    case 'password':
      break;
  }

  return errors;
};
