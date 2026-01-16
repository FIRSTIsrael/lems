'use client';

import React from 'react';
import { TitleSlide } from '../components/slides/title-slide';
import { ImageSlide } from '../components/slides/image-slide';
import {
  AwardWinnerSlide,
  type AwardWinnerSlideAward
} from '../components/slides/award-winner-slide';
import {
  AdvancingTeamsSlide,
  type AdvancingTeamsAward
} from '../components/slides/advancing-teams-slide';

export type AwardWinnerSlideStyle = 'chroma' | 'full' | 'both';

export interface Award {
  id: string;
  name: string;
  index: number;
  place: number;
  divisionColor?: string;
  winner?: unknown;
}

export interface BuildAwardsSlidesOptions {
  getAwardName?: (awardId: string) => string;
  getAwardDescription?: (awardId: string) => React.ReactNode;
  divisionColor?: string;
  awardTranslation: (name: string) => string;
  awardSectionTitle?: string;
}

/**
 * Builds an array of slide components for awards presentation.
 * Components are automatically imported from the presentations library.
 * @param awards - Array of award objects to present
 * @param style - Style of award winner slides: 'chroma', 'full', or 'both'
 * @param options - Optional configuration including award name/description getters and division color
 * @returns Array of React elements representing presentation slides
 */
export function buildAwardsSlides(
  awards: Award[],
  style: AwardWinnerSlideStyle = 'both',
  options?: BuildAwardsSlidesOptions
): React.ReactNode[] {
  if (!awards || awards.length === 0) {
    return [];
  }

  const slides: React.ReactNode[] = [];

  // Add season logo slide at the beginning
  slides.push(
    React.createElement(ImageSlide, {
      key: 'season-logo',
      src: '/assets/audience-display/season-logo.svg',
      alt: 'Season Logo'
    })
  );

  const { getAwardName, getAwardDescription, awardTranslation, divisionColor, awardSectionTitle } =
    options || {};

  // Add title slide after logo
  slides.push(
    React.createElement(TitleSlide, {
      key: 'awards-title',
      primary: awardSectionTitle || 'Awards Presentation'
    })
  );

  const awardsByIndex = new Map<number, Award[]>();
  const advancingAwards: Award[] = [];

  awards.forEach(award => {
    if (award.name === 'advancement') {
      advancingAwards.push(award);
    } else if (award.index >= 0) {
      if (!awardsByIndex.has(award.index)) {
        awardsByIndex.set(award.index, []);
      }
      awardsByIndex.get(award.index)!.push(award);
    }
  });

  const sortedIndices = Array.from(awardsByIndex.keys()).sort((a, b) => a - b);

  // Build slides for each award
  sortedIndices.forEach(index => {
    const awardGroup = awardsByIndex.get(index)!;
    if (awardGroup.length === 0) return;

    const firstAward = awardGroup[0];
    const showPlace = awardGroup.length > 1;

    // Get award display name
    const awardDisplayName = getAwardName ? getAwardName(firstAward.name) : firstAward.name;
    const awardDescription = getAwardDescription ? getAwardDescription(firstAward.name) : undefined;
    const awardTitle = awardTranslation ? awardTranslation(awardDisplayName) : awardDisplayName;

    const color = firstAward.divisionColor || divisionColor;

    // Add title slide with name only
    slides.push(
      React.createElement(TitleSlide, {
        key: `title-${index}`,
        primary: awardTitle,
        awardId: firstAward.name,
        divisionColor: color
      })
    );

    // Add title slide with description if available
    if (awardDescription) {
      slides.push(
        React.createElement(TitleSlide, {
          key: `title-description-${index}`,
          primary: awardTitle,
          secondary: awardDescription,
          awardId: firstAward.name,
          divisionColor: color
        })
      );
    }

    // Add winner slides based on style
    awardGroup.forEach(award => {
      const awardWithPlace: AwardWinnerSlideAward = {
        id: award.id,
        name: award.name,
        place: showPlace ? award.place : 0,
        divisionColor: color,
        winner: award.winner as AwardWinnerSlideAward['winner']
      };

      if (['chroma', 'both'].includes(style)) {
        slides.push(
          React.createElement(AwardWinnerSlide, {
            key: `chroma-${award.id}`,
            award: awardWithPlace,
            chromaKey: true
          })
        );
      }

      if (['full', 'both'].includes(style)) {
        slides.push(
          React.createElement(AwardWinnerSlide, {
            key: `full-${award.id}`,
            award: awardWithPlace,
            chromaKey: false
          })
        );
      }
    });
  });

  // Add advancing teams slide before first champions award if advancing teams exist
  if (advancingAwards.length > 0) {
    const firstChampionsIndex = slides.findIndex(
      slide =>
        React.isValidElement(slide) && typeof slide.key === 'string' && slide.key.includes('title')
    );
    const advancingSlide = React.createElement(AdvancingTeamsSlide, {
      key: 'advancing-teams',
      awards: advancingAwards as AdvancingTeamsAward[]
    });
    if (firstChampionsIndex >= 0) {
      slides.splice(firstChampionsIndex, 0, advancingSlide);
    } else {
      slides.push(advancingSlide);
    }
  }

  return slides;
}
