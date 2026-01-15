import React from 'react';

export type AwardWinnerSlideStyle = 'chroma' | 'full' | 'both';

export interface Award {
  id: string;
  name: string;
  index: number;
  place: number;
  divisionColor?: string;
  winner?: unknown;
}

export interface AwardSlideComponents {
  TitleSlide: React.ComponentType<{
    primary: string;
    secondary?: string;
    divisionColor?: string;
  }>;
  AwardWinnerSlide: React.ComponentType<{
    award: Award & { place: number };
    chromaKey: boolean;
  }>;
  AdvancingTeamsSlide: React.ComponentType<{ awards: Award[] }>;
}

export interface BuildAwardsSlidesOptions {
  getAwardName?: (awardId: string) => string | React.ReactNode;
  getAwardDescription?: (awardId: string) => string | React.ReactNode;
  divisionColor?: string;
}

export function buildAwardsSlides(
  awards: Award[],
  style: AwardWinnerSlideStyle = 'both',
  components: AwardSlideComponents,
  options?: BuildAwardsSlidesOptions
): React.ReactNode[] {
  if (!awards || awards.length === 0) {
    return [];
  }

  const slides: React.ReactNode[] = [];
  const { TitleSlide, AwardWinnerSlide, AdvancingTeamsSlide } = components;
  const { getAwardName, getAwardDescription, divisionColor } = options || {};

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

    // Get award display name
    const awardDisplayName = getAwardName ? getAwardName(firstAward.name) : firstAward.name;
    const awardDescription = getAwardDescription ? getAwardDescription(firstAward.name) : undefined;

    const color = firstAward.divisionColor || divisionColor;

    // Add title slide with name only
    slides.push(
      React.createElement(TitleSlide, {
        key: `title-${index}`,
        primary: `פרס ${awardDisplayName}`,
        divisionColor: color
      })
    );

    // Add title slide with description if available
    if (awardDescription) {
      slides.push(
        React.createElement(TitleSlide, {
          key: `title-description-${index}`,
          primary: `פרס ${awardDisplayName}`,
          secondary: awardDescription,
          divisionColor: color
        })
      );
    }

    // Add winner slides based on style
    awardGroup.forEach(award => {
      const awardWithPlace = {
        ...award,
        place: showPlace ? award.place : 0,
        divisionColor: color
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
      awards: advancingAwards
    });
    if (firstChampionsIndex >= 0) {
      slides.splice(firstChampionsIndex, 0, advancingSlide);
    } else {
      slides.push(advancingSlide);
    }
  }

  return slides;
}
