import { buildAwardsSlides as buildAwardsSlidesUtil, AwardWinnerSlideStyle, TitleSlide, AwardWinnerSlide, AdvancingTeamsSlide } from '@lems/presentations';
import { Award } from './graphql/types';

export type { AwardWinnerSlideStyle };

export function buildAwardsSlides(
  awards: Award[],
  style: AwardWinnerSlideStyle = 'both'
) {
  return buildAwardsSlidesUtil(awards, style, {
    TitleSlide,
    AwardWinnerSlide,
    AdvancingTeamsSlide
  });
}
