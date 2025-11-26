import { useVolunteer } from '../components/volunteer-context';

export const useUserOptions = (divisionId: string | undefined) => {
  const { volunteerData } = useVolunteer();

  if (!volunteerData) return null;

  if (!divisionId) {
    return volunteerData.volunteers;
  }

  return volunteerData.volunteers.filter(volunteer =>
    volunteer.divisions.some(division => division.id === divisionId)
  );
};
