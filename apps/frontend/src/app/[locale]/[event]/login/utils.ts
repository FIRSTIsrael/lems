import { LoginFormValues, LoginStep } from './types';
import type { VolunteerByRoleGraphQLData } from './graphql/volunteers.graphql';

export const validateForm = (values: LoginFormValues, currentStep: LoginStep) => {
  const errors: Partial<Record<keyof LoginFormValues, boolean>> = {};

  switch (currentStep) {
    case LoginStep.Role:
      if (!values.role) {
        errors.role = true;
      }
      break;
    case LoginStep.Division:
      if (!values.divisionId) {
        errors.divisionId = true;
      }
      break;
    case LoginStep.RoleInfo:
      if (!values.roleInfoValue.id || !values.roleInfoValue.name) {
        errors.roleInfoValue = true;
      }
      break;
    case LoginStep.User:
      if (!values.userId) {
        errors.userId = true;
      }
      break;
    case LoginStep.Password:
      if (!values.password) {
        errors.password = true;
      }
      break;
    default:
      break;
  }

  return errors;
};

/**
 * Infers the user ID from the available form data and volunteer data.
 * The login form is structured so that we always have enough information to determine the user ID.
 */
export const inferUserId = (
  values: LoginFormValues,
  volunteerData: VolunteerByRoleGraphQLData
): string => {
  if (values.userId) {
    return values.userId;
  }

  let filteredVolunteers = volunteerData.volunteers.filter(v => v.role === values.role);

  if (values.divisionId) {
    filteredVolunteers = filteredVolunteers.filter(v =>
      v.divisions.some(d => d.id === values.divisionId)
    );
  }

  if (values.roleInfoValue) {
    filteredVolunteers = filteredVolunteers.filter(v => {
      if (!v.roleInfo) return false;
      const roleInfo = v.roleInfo as Record<string, string>;
      return (
        roleInfo.tableId === values.roleInfoValue.id ||
        roleInfo.roomId === values.roleInfoValue.id ||
        roleInfo.category === values.roleInfoValue.id
      );
    });
  }

  if (filteredVolunteers.length === 1) {
    return filteredVolunteers[0].id;
  }

  // If we have multiple volunteers, this is an error - the form should have prompted for more info
  if (filteredVolunteers.length === 0) {
    throw new Error('No matching volunteer found with the provided information');
  }

  throw new Error(
    'Multiple volunteers match the provided information. User selection is required.'
  );
};

export interface LoginPayload {
  userId: string;
  password: string;
}

/**
 * Builds the login payload to send to the backend.
 * Only userId and password are required.
 */
export const buildLoginPayload = (
  values: LoginFormValues,
  volunteerData: VolunteerByRoleGraphQLData
): LoginPayload => {
  const userId = inferUserId(values, volunteerData);
  return {
    userId,
    password: values.password
  };
};

export const submitLogin = async (
  values: LoginFormValues,
  volunteerData: VolunteerByRoleGraphQLData | null
) => {
  if (!volunteerData) {
    throw new Error('Volunteer data is required to submit login');
  }

  const loginPayload: LoginPayload = buildLoginPayload(values, volunteerData);
  console.log('Submitting login with values:', loginPayload);
  // TODO: Implement actual login submission
  // This will be replaced with actual authentication logic
};
