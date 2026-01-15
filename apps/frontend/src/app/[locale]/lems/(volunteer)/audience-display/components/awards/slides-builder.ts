import {
  buildAwardsSlides as buildAwardsSlidesLib,
  AwardWinnerSlideStyle
} from '@lems/presentations';
import { Award } from './graphql';

export type { AwardWinnerSlideStyle };

/**
 * Builds an array of award presentation slides.
 * Internally uses TitleSlide, AwardWinnerSlide, and AdvancingTeamsSlide components.
 * @param awards - Array of awards to present
 * @param style - Style of award slides: 'chroma', 'full', or 'both'
 * @returns Array of React elements ready to render
 */
export function buildAwardsSlides(awards: Award[], style: AwardWinnerSlideStyle = 'both') {
  return buildAwardsSlidesLib(awards, style, {
    // Custom award name/description getters can be added here if needed
  });
}
