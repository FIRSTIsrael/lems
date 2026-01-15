import {
  buildAwardsSlides as buildAwardsSlidesUtil,
  AwardWinnerSlideStyle,
  TitleSlide,
  AwardWinnerSlide,
  AdvancingTeamsSlide,
  BuildAwardsSlidesOptions
} from '@lems/presentations';
import { Award } from './graphql';

export type { AwardWinnerSlideStyle };

export function buildAwardsSlides(
  awards: Award[],
  style: AwardWinnerSlideStyle = 'both',
  options?: BuildAwardsSlidesOptions
) {
  return buildAwardsSlidesUtil(
    awards,
    style,
    {
      TitleSlide,
      AwardWinnerSlide,
      AdvancingTeamsSlide
    },
    options
  );
}
