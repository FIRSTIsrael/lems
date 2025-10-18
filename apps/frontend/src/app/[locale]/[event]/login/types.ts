export interface LoginFormValues {
  currentStep: LoginStep;
  role: string;
  divisionId: string;
  roleInfoValue: string;
  userId: string;
  password: string;
}

export enum LoginStep {
  Role = 0,
  Division = 1,
  RoleInfo = 2,
  User = 3,
  Password = 4,
  Complete = 5
}
