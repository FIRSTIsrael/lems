'use client';

import { useEvent } from '../components/event-context';

export default function PitAdminPage() {
  const { eventId, currentDivision } = useEvent();

  return (
    <div>
      Pit Admin Page: {eventId} - {currentDivision.name}
    </div>
  );
}
