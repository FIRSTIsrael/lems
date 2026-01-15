import React, { useMemo, forwardRef } from 'react';
import { Deck, DeckRef, TitleSlide, ImageSlide } from '@lems/presentations';
import { useAwardsPresentationContext } from '@lems/shared';
import { useAwardTranslations } from '@lems/localization';
import { Award } from '../graphql';
import { buildAwardsSlides, AwardWinnerSlideStyle } from './awards/slides-builder';

export interface AwardsDisplayProps {
  awards: Award[];
  awardWinnerSlideStyle?: AwardWinnerSlideStyle;
  presentationState?: { slideIndex: number; stepIndex: number };
  divisionColor?: string;
}

export const AwardsDisplay = forwardRef<DeckRef, AwardsDisplayProps>(
  (
    {
      awards,
      awardWinnerSlideStyle = 'both',
      presentationState = { slideIndex: 0, stepIndex: 0 },
      divisionColor
    },
    ref
  ) => {
    const { awardsAssigned } = useAwardsPresentationContext();
    const { getName, getDescription } = useAwardTranslations();

    const awardSlides = useMemo(
      () =>
        buildAwardsSlides(awards, awardWinnerSlideStyle, {
          getAwardName: getName,
          getAwardDescription: getDescription,
          divisionColor
        }),
      [awards, awardWinnerSlideStyle, getName, getDescription, divisionColor]
    );

    if (!awardsAssigned) {
      console.warn(
        '[AwardsDisplay] Attempted to render awards presentation before awards_assigned flag was set. Rendering nothing.'
      );
      return null;
    }

    return (
      <Deck ref={ref} initialState={presentationState} enableReinitialize={true}>
        <ImageSlide src="/assets/audience-display/sponsors/FIRST-DIVE.svg" alt="FIRST DIVE" />
        <TitleSlide primary="טקס הפרסים" divisionColor={divisionColor} />
        {awardSlides}
        <TitleSlide
          primary="כל הכבוד לקבוצות!"
          secondary="נתראה בתחרויות הבאות!"
          divisionColor={divisionColor}
        />
      </Deck>
    );
  }
);

AwardsDisplay.displayName = 'AwardsDisplay';
