import React, { useMemo, forwardRef } from 'react';
import {
  Deck,
  DeckRef,
  TitleSlide,
  ImageSlide,
  buildAwardsSlides,
  AwardWinnerSlideStyle
} from '@lems/presentations';
import { useAwardTranslations } from '@lems/localization';
import { useAwardsPresentationContext } from '@lems/shared/providers';
import { useTranslations } from 'next-intl';
import { Award } from '../../graphql';

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
    const t = useTranslations('awards-presentation');

    const awardSlides = useMemo(
      () =>
        buildAwardsSlides(awards, awardWinnerSlideStyle, {
          getAwardName: getName,
          getAwardDescription: getDescription,
          divisionColor,
          awardTranslation: (name: string) => t('prize', { name })
        }),
      [awards, awardWinnerSlideStyle, getName, getDescription, divisionColor, t]
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
