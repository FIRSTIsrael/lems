'use client';

import { apiFetch } from '@lems/shared';
import { useRouter } from 'next/navigation';
import { useEvent } from '../components/event-context';
import useKeyboardShortcut from '../hooks/use-keyboard-shortcut';
import { usePageData } from '../hooks/use-page-data';
import { AudienceDisplayProvider } from './components/audience-display-context';
import { LogoDisplay } from './components/logo-display';
import { MessageDisplay } from './components/message-display';
import { SponsorsDisplay } from './components/sponsors-display';
import { MatchPreviewDisplay } from './components/match-preview/match-preview-display';
import { GET_AUDIENCE_DISPLAY_DATA, parseAudienceDisplayData } from './graphql';
import { ScoreboardDisplay } from './components/scoreboard/scoreboard-display';

export default function AudienceDisplayPage() {
  const { currentDivision } = useEvent();
  const router = useRouter();

  console.log('Ctrl + Shift + L to logout.');
  useKeyboardShortcut(
    () =>
      apiFetch('/lems/auth/logout', {
        method: 'POST'
      }).then(response => {
        if (response.ok) {
          router.push('/');
        } else {
          console.error('Logout failed:', response.error);
        }
      }),
    { code: 'KeyL', ctrlKey: true, shiftKey: true }
  );

  const { data, loading, error } = usePageData(
    GET_AUDIENCE_DISPLAY_DATA,
    {
      divisionId: currentDivision.id
    },
    parseAudienceDisplayData
  );

  if (error) {
    throw error || new Error('Failed to load audience display data');
  }

  if (loading || !data) {
    return null;
  }

  const activeDisplay = data.activeDisplay;

  return (
    <AudienceDisplayProvider data={data}>
      {activeDisplay === 'logo' && <LogoDisplay />}
      {activeDisplay === 'message' && <MessageDisplay />}
      {activeDisplay === 'sponsors' && <SponsorsDisplay />}
      {activeDisplay === 'match_preview' && <MatchPreviewDisplay />}
      {activeDisplay === 'scoreboard' && <ScoreboardDisplay />}
    </AudienceDisplayProvider>
  );
}
