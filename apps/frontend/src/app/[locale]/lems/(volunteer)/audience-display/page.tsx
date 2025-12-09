'use client';

import { useEvent } from '../components/event-context';
import { usePageData } from '../hooks/use-page-data';
import { GET_AUDIENCE_DISPLAY_DATA, parseAudienceDisplayData } from './audience-display.graphql';
import { AudienceDisplayProvider } from './components/audience-display-context';

export default function AudienceDisplayPage() {
  const { currentDivision } = useEvent();

  const { data, loading, error } = usePageData(
    GET_AUDIENCE_DISPLAY_DATA,
    {
      divisionId: currentDivision.id
    },
    parseAudienceDisplayData
  );

  if (error) {
    throw error || new Error('Failed to load scorekeeper data');
  }

  if (loading || !data) {
    return null;
  }

  console.log('Audience Display Data:', data);

  return <AudienceDisplayProvider data={data}>{JSON.stringify(data)}</AudienceDisplayProvider>;
}
