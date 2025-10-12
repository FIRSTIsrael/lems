import { LoginFormValues, LoginStep } from './types';

/**
 * Get the index of the current step in the step progression
 */
export const getStepIndex = (step: string): number => {
  const steps = ['role', 'division', 'association', 'user', 'password'];
  return steps.indexOf(step);
};

/**
 * Determine which steps should be displayed based on the current login state
 */
export const getActiveSteps = (currentStep: LoginStep): string[] => {
  const activeSteps = ['role'];

  if (currentStep.requiresDivision || currentStep.step === 'division') {
    activeSteps.push('division');
  }

  if (currentStep.requiresAssociation || currentStep.step === 'association') {
    activeSteps.push('association');
  }

  if (currentStep.multipleUsers || currentStep.step === 'user') {
    activeSteps.push('user');
  }

  if (
    currentStep.step === 'password' ||
    currentStep.step === 'complete' ||
    currentStep.step === 'initial'
  ) {
    activeSteps.push('password');
  }

  return activeSteps;
};

/**
 * Validate form values based on the current step
 */
export const validateForm = (values: LoginFormValues, currentStep: LoginStep) => {
  const errors: Partial<LoginFormValues> = {};

  switch (currentStep.step) {
    case 'role':
      if (!values.role) {
        errors.role = 'required';
      }
      break;
    case 'division':
      if (currentStep.requiresDivision && !values.divisionId) {
        errors.divisionId = 'required';
      }
      break;
    case 'association':
      if (currentStep.requiresAssociation && !values.associationValue) {
        errors.associationValue = 'required';
      }
      break;
    case 'user':
      if (currentStep.multipleUsers && !values.userId) {
        errors.userId = 'required';
      }
      break;
    case 'password':
      if (!values.password) {
        errors.password = 'required';
      } else if (values.password.length !== 4) {
        errors.password = 'invalid-length';
      }
      break;
  }

  return errors;
};

/**
 * Build the request body for login API call based on current form values
 */
export const buildLoginRequestBody = (
  eventSlug: string,
  values: LoginFormValues,
  currentStep: LoginStep,
  captchaToken?: string
): Record<string, unknown> => {
  const requestBody: Record<string, unknown> = {
    eventSlug,
    captchaToken
  };

  if (values.role) requestBody.role = values.role;
  if (values.divisionId) requestBody.divisionId = values.divisionId;
  if (currentStep.associationKey && values.associationValue) {
    requestBody.associationKey = currentStep.associationKey;
    requestBody.associationValue = values.associationValue;
  }
  if (values.userId) requestBody.userId = values.userId;
  if (values.password) requestBody.password = values.password;

  return requestBody;
};

/**
 * Sanitize and build the redirect URL after successful login
 */
export const buildRedirectUrl = (eventSlug: string, sanitizeFn: (url: string) => string): string => {
  const urlParams = new URLSearchParams(window.location.search);
  let returnUrl = urlParams.get('returnUrl') || `/${eventSlug}/dashboard`;

  if (!returnUrl.startsWith('/')) {
    returnUrl = `/${eventSlug}/dashboard`;
  } else {
    returnUrl = sanitizeFn(returnUrl);
    returnUrl = encodeURIComponent(returnUrl);
  }

  return decodeURIComponent(returnUrl);
};

/**
 * Parse error from API response
 */
export const parseApiError = (
  result: { ok: false; status: number; error: unknown }
): string => {
  if (result.status === 429) {
    return 'too-many-requests';
  }
  if (result.status === 401) {
    return 'invalid-password';
  }
  if (result.status === 404) {
    const errorData =
      result.error && typeof result.error === 'object' && 'error' in result.error
        ? (result.error as { error: string }).error
        : 'not-found';
    return errorData;
  }
  return 'server-error';
};
