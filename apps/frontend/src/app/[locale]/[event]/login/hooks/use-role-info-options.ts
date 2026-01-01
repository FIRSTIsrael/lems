'use client';

import { useSuspenseQuery, skipToken } from '@apollo/client/react';
import { useMemo } from 'react';
import { useJudgingCategoryTranslations } from '@lems/localization';
import { RoleInfo } from '../graphql/volunteers';
import { useVolunteer } from '../components/volunteer-context';
import { GET_DIVISION_VENUE_QUERY } from '../graphql/venue';

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
 * Handles fetching division data (tables/rooms) and filtering options
 * to match the role's volunteers.
 */
export const useRoleInfoOptions = (divisionId: string | undefined): RoleInfoOption[] => {
  const { volunteerData } = useVolunteer();
  const { getCategory } = useJudgingCategoryTranslations();

  const roleInfoType = getRoleInfoType(volunteerData?.volunteers[0].roleInfo);
  const shouldFetch = roleInfoType && roleInfoType !== 'category' && divisionId;

  const { data: divisionData } = useSuspenseQuery(
    GET_DIVISION_VENUE_QUERY,
    shouldFetch ? { variables: { id: divisionId } } : skipToken
  );

  return useMemo(() => {
    if (!roleInfoType || !volunteerData?.volunteers) return [];

    let allOptions: RoleInfoOption[] = [];

    if (roleInfoType === 'table' || roleInfoType === 'room') {
      if (divisionData?.division) {
        const items =
          roleInfoType === 'table' ? divisionData.division.tables : divisionData.division.rooms;
        allOptions = items.map((item: { id: string; name: string }) => ({
          id: item.id,
          name: item.name
        }));
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
  }, [divisionData, getCategory, roleInfoType, volunteerData]);
};
