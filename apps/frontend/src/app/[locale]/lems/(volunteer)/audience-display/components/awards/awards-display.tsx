import React, { useMemo, forwardRef } from 'react';
import { Deck, DeckRef, buildAwardsSlides, AwardWinnerSlideStyle } from '@lems/presentations';
import { useAwardTranslations } from '@lems/localization';
import { useAwardsPresentationContext } from '@lems/shared/providers';
import { useTranslations } from 'next-intl';
import { Award } from '../../graphql';

export interface AwardsDisplayProps {
  awards: Award[];
  awardWinnerSlideStyle?: AwardWinnerSlideStyle;
  divisionColor?: string;
}

export const AwardsDisplay = forwardRef<DeckRef, AwardsDisplayProps>(
  ({ awards, awardWinnerSlideStyle = 'both', divisionColor }, ref) => {
    const { awardsAssigned, presentationState } = useAwardsPresentationContext();
    const { getName, getDescription } = useAwardTranslations();
    const t = useTranslations('awards-presentation');

    const awardSlides = useMemo(
      () =>
        buildAwardsSlides(awards, awardWinnerSlideStyle, {
          getAwardName: getName,
          getAwardDescription: getDescription,
          divisionColor,
          awardTranslation: (name: string) => t('prize', { name }),
          awardSectionTitle: t('title-slide')
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
        {awardSlides}
      </Deck>
    );
  }
);

AwardsDisplay.displayName = 'AwardsDisplay';
