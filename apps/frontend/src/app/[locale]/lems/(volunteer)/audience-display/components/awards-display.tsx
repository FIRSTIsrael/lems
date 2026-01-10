import React, { useMemo, forwardRef } from 'react';
import { Deck, DeckRef } from '@lems/presentations';
import { Award } from './graphql/types';
import { buildAwardsSlides, AwardWinnerSlideStyle } from './slides-builder';
import { TitleSlide } from './slides/title-slide';

export interface AwardsDisplayProps {
  awards: Award[];
  awardWinnerSlideStyle?: AwardWinnerSlideStyle;
  presentationState?: { slideIndex: number; stepIndex: number };
}

export const AwardsDisplay = forwardRef<DeckRef, AwardsDisplayProps>(
  (
    { awards, awardWinnerSlideStyle = 'both', presentationState = { slideIndex: 0, stepIndex: 0 } },
    ref
  ) => {
    const awardSlides = useMemo(
      () => buildAwardsSlides(awards, awardWinnerSlideStyle),
      [awards, awardWinnerSlideStyle]
    );

    return (
      <Deck ref={ref} initialState={presentationState} enableReinitialize={true}>
        <TitleSlide primary="טקס הפרסים" />
        {awardSlides}
        <TitleSlide primary="כל הכבוד לקבוצות!" secondary="נתראה בתחרויות הבאות!" />
      </Deck>
    );
  }
);

AwardsDisplay.displayName = 'AwardsDisplay';
