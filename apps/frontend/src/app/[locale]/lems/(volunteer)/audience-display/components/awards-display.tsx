import React, { useMemo, forwardRef } from 'react';
import { Deck, DeckRef } from '@lems/presentations';
import { Award } from '../graphql';
import { buildAwardsSlides, AwardWinnerSlideStyle } from './awards/slides-builder';
import { TitleSlide } from './awards/slides/title-slide';
import { useAudienceDisplay } from './audience-display-context';

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
    const { awardsAssigned } = useAudienceDisplay();

    const awardSlides = useMemo(
      () => buildAwardsSlides(awards, awardWinnerSlideStyle),
      [awards, awardWinnerSlideStyle]
    );

    if (!awardsAssigned) {
      console.warn(
        '[AwardsDisplay] Attempted to render awards presentation before awards_assigned flag was set. Rendering nothing.'
      );
      return null;
    }

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
