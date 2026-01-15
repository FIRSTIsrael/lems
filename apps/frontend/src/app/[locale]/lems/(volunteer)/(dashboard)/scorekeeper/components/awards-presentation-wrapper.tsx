'use client';

import React, { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { useMutation } from '@apollo/client/react';
import { AwardsPresentationProvider } from '@lems/shared';
import { UPDATE_AUDIENCE_DISPLAY_SETTING_MUTATION } from '../graphql';
import { useEvent } from '../../../components/event-context';
import { useScorekeeperData } from './scorekeeper-context';
import { AwardsPresentationDisplay } from './awards-presentation';

function AwardsPresentationContent() {
  const t = useTranslations('pages.scorekeeper.awards-presentation');
  const { currentDivision } = useEvent();

  const [updateAudienceDisplaySetting] = useMutation(UPDATE_AUDIENCE_DISPLAY_SETTING_MUTATION, {
    onError: () => {
      toast.error('Failed to update presentation state');
    }
  });

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

  // Store the mutation callback for use by the display component if needed
  React.useEffect(() => {
    // This allows the display component to access the update function if needed
  }, [handlePresentationStateChange]);

  return (
    <AwardsPresentationDisplay
      currentSlideLabel={t('current-slide')}
      nextSlideLabel={t('next-slide')}
    />
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
