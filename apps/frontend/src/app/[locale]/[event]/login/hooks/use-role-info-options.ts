'use client';

import useSWR from 'swr';
import { useMemo } from 'react';
import { useJudgingCategoryTranslations } from '@lems/localization';
import { RoleInfo } from '../graphql/volunteers.graphql';
import { useVolunteer } from '../components/volunteer-context';
import { fetchDivisionVenue } from '../graphql/role-info-step.graphql';

type RoleInfoType = 'table' | 'room' | 'category';

export const getRoleInfoType = (roleInfo: RoleInfo | null | undefined): RoleInfoType | null => {
  if (!roleInfo) return null;
  if (roleInfo.__typename === 'TableRoleInfo') return 'table';
  if (roleInfo.__typename === 'RoomRoleInfo') return 'room';
  if (roleInfo.__typename === 'CategoryRoleInfo') return 'category';
  return null;
};

const getRoleInfoValue = (roleInfo: RoleInfo | null | undefined): string => {
  if (!roleInfo) return '';
  if (roleInfo.__typename === 'TableRoleInfo') return roleInfo.tableId;
  if (roleInfo.__typename === 'RoomRoleInfo') return roleInfo.roomId;
  if (roleInfo.__typename === 'CategoryRoleInfo') return roleInfo.category;
  return '';
};

interface RoleInfoOption {
  id: string;
  name: string;
}

/**
 * Hook that calculates available role info options based on volunteer data.
 * Handles fetching division data (tables/rooms) and filtering options to match the role's volunteers.
 */
export const useRoleInfoOptions = (divisionId: string | undefined): RoleInfoOption[] => {
  const { volunteerData } = useVolunteer();
  const { getCategory } = useJudgingCategoryTranslations();

  const roleInfoType = getRoleInfoType(volunteerData?.volunteers[0].roleInfo);
  const shouldFetch = roleInfoType && roleInfoType !== 'category' && divisionId;

  // Fetch tables and rooms for table/room types
  const { data: divisionData } = useSWR(
    shouldFetch ? `division-venue-${divisionId}` : null,
    () => (shouldFetch ? fetchDivisionVenue(divisionId!) : Promise.resolve(null)),
    { suspense: true, fallbackData: null }
  );

  return useMemo(() => {
    if (!roleInfoType || !volunteerData?.volunteers) return [];

    let allOptions: RoleInfoOption[] = [];

    if (roleInfoType === 'table' || roleInfoType === 'room') {
      if (divisionData) {
        const items = roleInfoType === 'table' ? divisionData.tables : divisionData.rooms;
        allOptions = items.map(item => ({ id: item.id, name: item.name }));
      }
    } else if (roleInfoType === 'category') {
      allOptions = [
        { id: 'core-values', name: getCategory('core-values') },
        { id: 'robot-design', name: getCategory('robot-design') },
        { id: 'innovation-project', name: getCategory('innovation-project') }
      ];
    }

    // Filter to only options that match this role's volunteers
    const roleInfoValuesForRole = new Set(
      volunteerData.volunteers.map(v => getRoleInfoValue(v.roleInfo))
    );
    return allOptions.filter(opt => roleInfoValuesForRole.has(opt.id));
  }, [roleInfoType, volunteerData?.volunteers, divisionData, getCategory]);
};
