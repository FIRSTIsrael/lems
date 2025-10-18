'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';
import {
  fetchVolunteerRoles,
  fetchVolunteerByRole,
  VolunteerByRoleGraphQLData
} from '../graphql/volunteers.graphql';

interface VolunteerContextType {
  allRoles: string[];

  isReady: boolean;
  volunteerData: VolunteerByRoleGraphQLData | null;

  selectedRole: string | null;
  setSelectedRole: (role: string | null) => void;

  needsDivision: boolean;
  needsRoleInfo: boolean;
  needsUser: boolean;
}

const VolunteerContext = createContext<VolunteerContextType | undefined>(undefined);

interface VolunteerProviderProps {
  eventSlug: string;
  children: React.ReactNode;
}

export function VolunteerProvider({ eventSlug, children }: VolunteerProviderProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const { data: allRoles = [] } = useSWR<string[]>(
    `volunteer-roles-${eventSlug}`,
    () => fetchVolunteerRoles(eventSlug),
    { suspense: true, fallbackData: [] }
  );

  const { data: volunteerData = null, error: volunteerError } =
    useSWR<VolunteerByRoleGraphQLData | null>(
      selectedRole ? `volunteer-by-role-${eventSlug}-${selectedRole}` : null,
      selectedRole ? () => fetchVolunteerByRole(eventSlug, selectedRole) : null,
      { suspense: true, fallbackData: null }
    );

  if (volunteerError) {
    console.error('Error fetching volunteer data:', volunteerError);
    throw volunteerError;
  }

  const _needsUser = (volunteers: VolunteerByRoleGraphQLData['volunteers']) => {
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

    return Object.values(assignmentCounts).some(count => count > 1);
  };

  const checkFunctions = useMemo(() => {
    const totalDivisions = volunteerData?.divisions.length || 0;
    const volunteers = volunteerData?.volunteers || [];

    return {
      needsDivision: volunteers.some(v => v.divisions.length < totalDivisions),
      needsRoleInfo: volunteers.some(v => !!v.roleInfo),
      needsUser: _needsUser(volunteers)
    };
  }, [volunteerData]);

  const isReady = selectedRole && volunteerData;

  const value: VolunteerContextType = {
    allRoles,
    volunteerData: volunteerData || null,
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
