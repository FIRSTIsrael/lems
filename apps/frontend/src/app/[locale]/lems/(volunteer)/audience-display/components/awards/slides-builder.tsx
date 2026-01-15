import React from 'react';
import { TitleSlide } from './slides/title-slide';
import { AwardWinnerSlide } from './slides/award-winner-slide';
import { AdvancingTeamsSlide } from './slides/advancing-teams-slide';
import { Award } from './graphql';

export type AwardWinnerSlideStyle = 'chroma' | 'full' | 'both';

export function buildAwardsSlides(
  awards: Award[],
  style: AwardWinnerSlideStyle = 'both'
): React.ReactNode[] {
  console.log('[buildAwardsSlides] Input:', { awards, awardsCount: awards.length, style });

  if (!awards || awards.length === 0) {
    console.log('[buildAwardsSlides] No awards, returning empty array');
    return [];
  }

  const slides: React.ReactNode[] = [];

  // Group awards by index
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

  // Sort indices
  const sortedIndices = Array.from(awardsByIndex.keys()).sort((a, b) => a - b);

  // Build slides for each award
  sortedIndices.forEach(index => {
    const awardGroup = awardsByIndex.get(index)!;
    if (awardGroup.length === 0) return;

    const firstAward = awardGroup[0];
    const showPlace = awardGroup.length > 1;

    // Add title slide
    slides.push(
      React.createElement(TitleSlide, {
        key: `title-${index}`,
        primary: `פרס ${firstAward.name}`,
        secondary: 'מיוחד לצוותים במדגם'
      })
    );

    // Add winner slides based on style
    awardGroup.forEach(award => {
      const awardWithPlace = { ...award, place: showPlace ? award.place : 0 };

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

  // Add advancing teams slide before champions if advancing teams exist
  if (advancingAwards.length > 0) {
    const championsIndex = slides.findIndex(
      slide =>
        React.isValidElement(slide) && typeof slide.key === 'string' && slide.key.includes('title')
    );
    const advancingSlide = React.createElement(AdvancingTeamsSlide, {
      key: 'advancing-teams',
      awards: advancingAwards
    });
    if (championsIndex >= 0) {
      slides.splice(championsIndex, 0, advancingSlide);
    } else {
      slides.push(advancingSlide);
    }
  }

  console.log('[buildAwardsSlides] Created slides:', {
    slidesCount: slides.length,
    slideKeys: slides.map(s => (React.isValidElement(s) ? s.key : 'invalid')),
    slides
  });

  return slides;
}
