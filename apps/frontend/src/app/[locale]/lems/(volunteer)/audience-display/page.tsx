'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@lems/shared';
import { useEvent } from '../components/event-context';
import useKeyboardShortcut from '../hooks/use-keyboard-shortcut';
import { usePageData } from '../hooks/use-page-data';
import { AudienceDisplayProvider } from './components/audience-display-context';
import { LogoDisplay } from './components/logo-display';
import { MessageDisplay } from './components/message-display';
import { SponsorsDisplay } from './components/sponsors-display';
import { MatchPreviewDisplay } from './components/match-preview/match-preview-display';
import { ScoreboardDisplay } from './components/scoreboard/scoreboard-display';
import { AwardsDisplay } from './components/awards/awards-display';
import {
  createAudienceDisplaySettingUpdatedSubscription,
  createAudienceDisplaySwitchedSubscription,
  GET_AUDIENCE_DISPLAY_DATA,
  parseAudienceDisplayData
} from './graphql';
import type { AudienceDisplayState, Award } from './graphql';

interface ParsedAudienceDisplayData {
  displayState: AudienceDisplayState;
  awards: Award[];
  awardsAssigned: boolean;
}

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

  const subscriptions = useMemo(
    () => [
      createAudienceDisplaySwitchedSubscription(currentDivision.id),
      createAudienceDisplaySettingUpdatedSubscription(currentDivision.id)
    ],
    [currentDivision.id]
  );

  const { data, loading, error } = usePageData(
    GET_AUDIENCE_DISPLAY_DATA,
    {
      divisionId: currentDivision.id
    },
    (rawData): ParsedAudienceDisplayData => {
      const displayState = parseAudienceDisplayData(rawData);
      const awards = rawData.division.judging?.awards ?? [];
      const awardsAssigned = rawData.division.awardsAssigned;
      return { displayState, awards, awardsAssigned };
    },
    subscriptions
  );

  if (error) {
    throw error || new Error('Failed to load audience display data');
  }

  if (loading || !data) {
    return null;
  }

  const activeDisplay = data.displayState.activeDisplay;

  return (
    <AudienceDisplayProvider
      displayState={data.displayState}
      awards={data.awards}
      awardsAssigned={data.awardsAssigned}
    >
      {activeDisplay === 'logo' && <LogoDisplay />}
      {activeDisplay === 'message' && <MessageDisplay />}
      {activeDisplay === 'sponsors' && <SponsorsDisplay />}
      {activeDisplay === 'match_preview' && <MatchPreviewDisplay />}
      {activeDisplay === 'scoreboard' && <ScoreboardDisplay />}
      {activeDisplay === 'awards' && (
        <AwardsDisplay
          awards={data.awards}
          awardWinnerSlideStyle={
            (data.displayState.settings?.awards?.awardWinnerSlideStyle as
              | 'chroma'
              | 'full'
              | 'both') || 'both'
          }
          presentationState={
            (data.displayState.settings?.awards?.presentationState as {
              slideIndex: number;
              stepIndex: number;
            }) || { slideIndex: 0, stepIndex: 0 }
          }
        />
      )}
    </AudienceDisplayProvider>
  );
}
