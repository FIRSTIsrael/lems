'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { AwardsPresentationProvider, Award as PresentationAward } from '@lems/shared/providers';
import { TeamWinner } from '../../graphql';
import { useScorekeeperData } from '../scorekeeper-context';
import { AwardsPresentationDisplay } from './display';

function AwardsPresentationContent() {
  const t = useTranslations('pages.scorekeeper.awards-presentation');

  return (
    <AwardsPresentationDisplay
      currentSlideLabel={t('current-slide')}
      nextSlideLabel={t('next-slide')}
    />
  );
}

export function AwardsPresentationWrapper() {
  const data = useScorekeeperData();

  const mappedAwards = useMemo<PresentationAward[]>(() => {
    return (data.judging?.awards ?? [])
      .filter(award => award.type === 'TEAM' && award.winner && 'team' in award.winner)
      .map(award => {
        const winner = award.winner as TeamWinner;

        return {
          id: award.id,
          name: award.name,
          index: award.index,
          place: award.place,
          type: award.type,
          isOptional: award.isOptional,
          winner: {
            id: winner.team.id,
            name: winner.team.name,
            number: winner.team.number,
            city: winner.team.city,
            affiliation: winner.team.affiliation
          }
        };
      });
  }, [data.judging?.awards]);

  console.log('[AwardsPresentationWrapper] Raw data:', {
    judging: data.judging,
    awards: data.judging?.awards,
    awardsCount: data.judging?.awards?.length,
    awardsAssigned: data.awardsAssigned,
    firstAwardDetail: data.judging?.awards?.[0]
  });

  return (
    <AwardsPresentationProvider
      awards={mappedAwards}
      awardsAssigned={data.awardsAssigned}
      awardWinnerSlideStyle={
        (data.field?.audienceDisplay?.settings?.awards?.awardWinnerSlideStyle as
          | 'chroma'
          | 'full'
          | 'both') || 'both'
      }
      presentationState={
        (data.field?.audienceDisplay?.awardsPresentation as {
          slideIndex: number;
          stepIndex: number;
        }) || { slideIndex: 0, stepIndex: 0 }
      }
    >
      <AwardsPresentationContent />
    </AwardsPresentationProvider>
  );
}
