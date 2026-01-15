'use client';

import React, { useRef, useCallback, useMemo } from 'react';
import { Stack } from '@mui/material';
import { DeckRef } from '@lems/presentations';
import toast from 'react-hot-toast';
import { useMutation } from '@apollo/client/react';
import { AwardsPresentationProvider, useAwardsPresentationContext } from '@lems/shared';
import { AwardsDisplay } from '../../../audience-display/components/awards-display';
import { UPDATE_AUDIENCE_DISPLAY_SETTING_MUTATION } from '../graphql';
import { useEvent } from '../../../components/event-context';
import { useScorekeeperData } from './scorekeeper-context';
import { PresentationController } from './presentation-controller';

function AwardsPresentationContent() {
  const deckRef = useRef<DeckRef | null>(null);
  const { currentDivision } = useEvent();
  const { awards, awardWinnerSlideStyle, presentationState } = useAwardsPresentationContext();

  const [updateAudienceDisplaySetting] = useMutation(UPDATE_AUDIENCE_DISPLAY_SETTING_MUTATION, {
    onError: () => {
      toast.error('Failed to update presentation state');
    }
  });

  // Calculate total slides: title + awards grouped by index
  const totalSlides = useMemo(() => {
    if (!awards.length) return 0;
    const uniqueIndices = new Set(awards.map(a => a.index));
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
      <div
        style={{
          flex: 1,
          backgroundColor: 'black',
          borderRadius: '8px',
          overflow: 'hidden',
          minHeight: 0
        }}
      >
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

export function AwardsPresentationWrapper() {
  const data = useScorekeeperData();

  return (
    <AwardsPresentationProvider
      awards={data.judging?.awards ?? []}
      awardsAssigned={data.awardsAssigned}
      awardWinnerSlideStyle={
        (data.field?.audienceDisplay?.settings?.awards?.awardWinnerSlideStyle as
          | 'chroma'
          | 'full'
          | 'both') || 'both'
      }
      presentationState={
        (data.field?.audienceDisplay?.settings?.awards?.presentationState as {
          slideIndex: number;
          stepIndex: number;
        }) || { slideIndex: 0, stepIndex: 0 }
      }
    >
      <AwardsPresentationContent />
    </AwardsPresentationProvider>
  );
}
