export interface LoginFormValues {
  role: string;
  divisionId: string;
  associationValue: string;
  userId: string;
  password: string;
}

export interface LoginFormProps {
  eventSlug: string;
  recaptchaRequired: boolean;
}

export interface LoginStep {
  step: 'role' | 'division' | 'association' | 'user' | 'password' | 'complete' | 'initial';
  roles?: string[];
  divisions?: Array<{ id: string; name: string }>;
  associations?: Array<{ key: string; value: string; label: string }>;
  users?: Array<{ id: string; identifier: string | null }>;
  requiresDivision?: boolean;
  requiresAssociation?: boolean;
  associationKey?: string;
  multipleUsers?: boolean;
}

export interface LoginStepContentProps {
  currentStep: LoginStep;
  values: LoginFormValues;
  isSubmitting: boolean;
  showPassword: boolean;
  onFieldChange: (field: keyof LoginFormValues, value: string) => void;
  onPasswordVisibilityToggle: () => void;
}
