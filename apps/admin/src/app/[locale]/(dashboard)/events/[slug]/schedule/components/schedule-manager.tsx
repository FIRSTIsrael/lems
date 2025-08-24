'use client';

import useSWR from 'swr';
import { Division, TeamWithDivision } from '@lems/types/api/admin';

interface ScheduleManagerProp {
  division: Division;
}

export const ScheduleManager: React.FC<ScheduleManagerProp> = ({ division }) => {
  const { data: teams = [] } = useSWR<TeamWithDivision[]>(
    `/admin/events/${division.eventId}/divisions/${division.id}/teams`,
    { suspense: true }
  );

  const { data: rooms = [] } = useSWR<TeamWithDivision[]>(
    `/admin/events/${division.eventId}/divisions/${division.id}/rooms`,
    { suspense: true }
  );

  const { data: tables = [] } = useSWR<TeamWithDivision[]>(
    `/admin/events/${division.eventId}/divisions/${division.id}/tables`,
    { suspense: true }
  );

  console.log({ teams, rooms, tables });
  return <></>;
};
