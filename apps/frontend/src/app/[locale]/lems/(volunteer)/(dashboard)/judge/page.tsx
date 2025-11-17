'use client';

import { useUser } from '../../../components/user-context';
import { useEvent } from '../../components/event-context';
import { usePageData } from '../../hooks/use-page-data';
import { GET_ROOM_JUDGING_SESSIONS } from './judge.graphql';

export default function JudgePage() {
  const { currentDivision } = useEvent();
  const { roleInfo } = useUser();

  const { data } = usePageData(GET_ROOM_JUDGING_SESSIONS, {
    divisionId: currentDivision.id,
    roomId: roleInfo?.['roomId']
  });

  return <div>{JSON.stringify(data)}</div>;
}
