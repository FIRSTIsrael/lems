'use client';

import React, { useRef, useCallback, useMemo } from 'react';
import { Stack } from '@mui/material';
import { DeckRef } from '@lems/presentations';
import toast from 'react-hot-toast';
import { useMutation } from '@apollo/client/react';
import { AwardsDisplay } from '../../../audience-display/components/awards-display';
import { UPDATE_AUDIENCE_DISPLAY_SETTING_MUTATION } from '../graphql';
import { useEvent } from '../../../components/event-context';
import { useScorekeeperData } from './scorekeeper-context';
import { PresentationController } from './presentation-controller';

interface Award {
  id: string;
  name: string;
  index: number;
  place: number;
  type: string;
  isOptional: boolean;
  winner?: {
    id: string;
    name?: string;
    number?: number;
    affiliation?: { id: string; name: string; city: string };
  };
}

interface ScorekeeperContextData {
  field: {
    audienceDisplay?: {
      settings?: {
        awards?: {
          awardWinnerSlideStyle?: 'chroma' | 'full' | 'both';
          presentationState?: {
            slideIndex: number;
            stepIndex: number;
          };
        };
      };
    };
    judging?: {
      awards: Award[];
    };
  };
}

export function AwardsPresentationWrapper() {
  const deckRef = useRef<DeckRef | null>(null);
  const { currentDivision } = useEvent();
  const data = useScorekeeperData() as unknown as ScorekeeperContextData;
  const field = data?.field;

  const [updateAudienceDisplaySetting] = useMutation(UPDATE_AUDIENCE_DISPLAY_SETTING_MUTATION, {
    onError: () => {
      toast.error('Failed to update presentation state');
    }
  });

  const awardWinnerSlideStyle =
    field?.audienceDisplay?.settings?.awards?.awardWinnerSlideStyle || 'both';
  const presentationState = field?.audienceDisplay?.settings?.awards?.presentationState || {
    slideIndex: 0,
    stepIndex: 0
  };

  const awards = useMemo(() => field?.judging?.awards ?? [], [field?.judging?.awards]);

  // Calculate total slides: title + awards grouped by index
  const totalSlides = useMemo(() => {
    if (!awards.length) return 0;
    const uniqueIndices = new Set(awards.map((a: Award) => a.index));
    return 1 + uniqueIndices.size; // title slide + one per award index
  }, [awards]);

  const handlePresentationStateChange = useCallback(
    (slideIndex: number, stepIndex: number) => {
      updateAudienceDisplaySetting({
        variables: {
          divisionId: currentDivision.id,
          display: 'awards',
          settingKey: 'presentationState',
          settingValue: { slideIndex, stepIndex }
        }
      });
    },
    [updateAudienceDisplaySetting, currentDivision.id]
  );

  return (
    <Stack spacing={2} height="100%">
      <div className="flex-1 bg-black rounded-lg overflow-hidden">
        <AwardsDisplay
          ref={deckRef}
          awards={awards}
          awardWinnerSlideStyle={awardWinnerSlideStyle}
          presentationState={presentationState}
        />
      </div>
      <PresentationController
        deckRef={deckRef}
        onPresentationStateChange={handlePresentationStateChange}
        totalSlides={totalSlides}
      />
    </Stack>
  );
}
