export interface LoginFormValues {
  role: string;
  divisionId: string;
  associationValue: string;
  userId: string;
  password: string;
}

export type LoginStep = 'role' | 'division' | 'association' | 'user' | 'password' | 'complete';
