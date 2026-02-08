'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { AwardsPresentationProvider, Award as PresentationAward } from '@lems/shared/providers';
import { TeamWinner } from '../../graphql';
import { useScorekeeperData } from '../scorekeeper-context';
import { AwardsPresentationDisplay } from './display';

export function AwardsPresentationWrapper() {
  const data = useScorekeeperData();
  const t = useTranslations('pages.scorekeeper.awards-presentation');

  const mappedAwards = useMemo<PresentationAward[]>(() => {
    return (data.judging?.awards ?? [])
      .filter(award => award.type === 'TEAM' && award.winner && 'team' in award.winner)
      .map(award => {
        const winner = award.winner as TeamWinner;
        const teamData = winner.team;

        // Ensure team data is valid before accessing properties
        if (!teamData || !teamData.id || !teamData.name) {
          return undefined;
        }

        const mappedAward: PresentationAward = {
          id: award.id,
          name: award.name,
          index: award.index,
          place: award.place,
          type: award.type,
          isOptional: award.isOptional,
          winner: {
            id: teamData.id,
            name: teamData.name,
            number: teamData.number ? String(teamData.number) : '',
            city: teamData.city || '',
            affiliation: teamData.affiliation || ''
          }
        };
        return mappedAward;
      })
      .filter((award): award is PresentationAward => award !== undefined);
  }, [data.judging?.awards]);

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
        data.field?.audienceDisplay?.awardsPresentation != null
          ? (data.field.audienceDisplay.awardsPresentation as {
              slideIndex: number;
              stepIndex: number;
            })
          : { slideIndex: 0, stepIndex: 0 }
      }
    >
      <AwardsPresentationDisplay
        currentSlideLabel={t('current-slide')}
        nextSlideLabel={t('next-slide')}
      />
    </AwardsPresentationProvider>
  );
}
