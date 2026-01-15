'use client';

import React, { useRef, useCallback, useMemo } from 'react';
import { Stack } from '@mui/material';
import { DeckRef } from '@lems/presentations';
import toast from 'react-hot-toast';
import { useMutation } from '@apollo/client/react';
import type { Award as AudienceAward } from '../../../audience-display/graphql/types';
import { AwardsDisplay } from '../../../audience-display/components/awards-display';
import { UPDATE_AUDIENCE_DISPLAY_SETTING_MUTATION } from '../graphql';
import { useEvent } from '../../../components/event-context';
import { useScorekeeperData } from './scorekeeper-context';
import { PresentationController } from './presentation-controller';

interface ScorekeeperAward {
  id: string;
  name: string;
  index: number;
  place: number;
  type: 'PERSONAL' | 'TEAM';
  isOptional: boolean;
  winner?: {
    team?: {
      id: string;
      name: string;
      number: string;
      affiliation: string;
    };
    name?: string;
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
  };
  judging?: {
    awards: ScorekeeperAward[];
  };
}

export function AwardsPresentationWrapper() {
  const deckRef = useRef<DeckRef | null>(null);
  const { currentDivision } = useEvent();
  const data = useScorekeeperData() as unknown as ScorekeeperContextData;
  const field = data?.field;
  const judging = data?.judging;

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

  const awards = useMemo(() => {
    const rawAwards = judging?.awards ?? [];
    return rawAwards.map((award): AudienceAward => {
      let winner: AudienceAward['winner'] = null;
      if (award.winner) {
        if ('team' in award.winner && award.winner.team) {
          winner = {
            id: award.winner.team.id,
            name: award.winner.team.name,
            number: parseInt(award.winner.team.number),
            affiliation: {
              id: award.winner.team.id,
              name: award.winner.team.affiliation,
              city: ''
            }
          };
        } else if ('name' in award.winner && award.winner.name) {
          winner = {
            id: '',
            name: award.winner.name,
            team: {
              id: '',
              number: 0,
              name: ''
            }
          };
        }
      }
      return {
        id: award.id,
        name: award.name,
        index: award.index,
        place: award.place,
        type: award.type,
        isOptional: award.isOptional,
        winner
      };
    });
  }, [judging?.awards]);

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
