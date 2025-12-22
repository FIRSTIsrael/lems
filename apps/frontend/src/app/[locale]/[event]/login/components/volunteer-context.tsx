'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { useSuspenseQuery, useQuery } from '@apollo/client/react';
import {
  GET_VOLUNTEER_ROLES_QUERY,
  GET_VOLUNTEER_BY_ROLE_QUERY,
  VolunteerByRoleGraphQLData
} from '../graphql/volunteers';

interface VolunteerContextType {
  allRoles: string[];

  isReady: boolean;
  isLoadingVolunteerData: boolean;
  volunteerData: VolunteerByRoleGraphQLData | null;

  selectedRole: string | null;
  setSelectedRole: (role: string | null) => void;

  needsDivision: boolean;
  needsRoleInfo: boolean;
  needsUser: (divisionId?: string) => boolean;
}

const VolunteerContext = createContext<VolunteerContextType | undefined>(undefined);

interface VolunteerProviderProps {
  eventSlug: string;
  children: React.ReactNode;
}

/**
 * Volunteer provider that manages volunteer data fetching
 */
export function VolunteerProvider({ eventSlug, children }: VolunteerProviderProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const { data: rolesData } = useSuspenseQuery(GET_VOLUNTEER_ROLES_QUERY, {
    variables: { slug: eventSlug }
  });

  const { data: volunteerData, loading: isLoadingVolunteerData } = useQuery(
    GET_VOLUNTEER_BY_ROLE_QUERY,
    {
      variables: { slug: eventSlug, role: selectedRole! },
      skip: !selectedRole,
      fetchPolicy: 'cache-and-network'
    }
  );

  // Extract and deduplicate roles
  const allRoles = useMemo(() => {
    if (!rolesData?.event?.volunteers) return [];
    return Array.from(new Set(rolesData.event.volunteers.map((v: { role: string }) => v.role)));
  }, [rolesData]);

  const _needsUser = (
    volunteers: VolunteerByRoleGraphQLData['volunteers'],
    divisionId?: string
  ) => {
    const assignmentCounts = volunteers.reduce(
      (acc, volunteer) => {
        if (volunteer.roleInfo) {
          return acc; // We ignore users with roleInfo as they never require user selection
        }

        for (const division of volunteer.divisions) {
          acc[division.id] ??= 0;
          acc[division.id] = acc[division.id] + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    if (divisionId) {
      return (assignmentCounts[divisionId] || 0) > 1;
    }

    return Object.values(assignmentCounts).some(count => count > 1);
  };

  const volunteerDataValue = selectedRole ? volunteerData?.event || null : null;

  const checkFunctions = useMemo(() => {
    const totalDivisions = volunteerDataValue?.divisions.length || 0;
    const volunteers = volunteerDataValue?.volunteers || [];

    return {
      needsDivision: volunteers.some(v => v.divisions.length < totalDivisions),
      needsRoleInfo: volunteers.some(v => !!v.roleInfo),
      needsUser: (divisionId?: string) => _needsUser(volunteers, divisionId)
    };
  }, [volunteerDataValue]);

  const isReady = selectedRole && volunteerDataValue && !isLoadingVolunteerData;

  const value: VolunteerContextType = {
    allRoles,
    volunteerData: volunteerDataValue,
    isLoadingVolunteerData,
    isReady: !!isReady,
    selectedRole,
    setSelectedRole,
    ...checkFunctions
  };

  return <VolunteerContext.Provider value={value}>{children}</VolunteerContext.Provider>;
}

export function useVolunteer() {
  const context = useContext(VolunteerContext);
  if (context === undefined) {
    throw new Error('useVolunteer must be used within a VolunteerProvider');
  }
  return context;
}
