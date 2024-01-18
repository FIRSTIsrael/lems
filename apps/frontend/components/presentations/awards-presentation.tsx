import { Fragment, forwardRef } from 'react';
import dayjs from 'dayjs';
import { WithId } from 'mongodb';
import { Box, BoxProps } from '@mui/material';
import { Event, Award, Team } from '@lems/types';
import { localizedAward } from '@lems/season';
import { Deck, DeckView, DeckRef } from '@lems/presentations';
import TitleSlide from './title-slide';
import ImageSlide from './image-slide';
import AwardWinnerSlide from './award-winner-slide';
import AdvancingTeamsSlide from './advancing-teams-slide';

interface AwardsPresentationProps extends BoxProps {
  event: WithId<Event>;
  teams: Array<WithId<Team>>;
  awards: Array<WithId<Award>>;
  initialState?: DeckView;
  onViewUpdate?: (activeView: DeckView) => void;
  enableReinitialize?: boolean;
}

const AwardsPresentation = forwardRef<DeckRef, AwardsPresentationProps>(
  (
    {
      event,
      teams,
      awards,
      initialState = {
        slideIndex: 0,
        stepIndex: 0
      },
      onViewUpdate,
      enableReinitialize,
      ...props
    },
    ref
  ) => {
    const awardIndices = [...new Set(awards.flatMap(a => a.index))].sort((a, b) => a - b);
    const advancingTeams = teams.filter(t => t.advancing);

    const awardSlides = awardIndices.map(index => {
      const sortedAwards = awards.filter(a => a.index === index).sort((a, b) => b.place - a.place);
      const { name: awardName } = sortedAwards[0];
      const localized = localizedAward[awardName];

      return (
        <Fragment key={awardName}>
          <TitleSlide primary={`פרס ${localized.name}`} />
          <TitleSlide primary={`פרס ${localized.name}`} secondary={localized.description} />
          {sortedAwards.map(award => {
            return (
              <AwardWinnerSlide
                key={award.place}
                name={`פרס ${localized.name}`}
                place={sortedAwards.length > 1 ? award.place : undefined}
                winner={award.winner || ''}
                color={event.color}
              />
            );
          })}
        </Fragment>
      );
    });

    if (advancingTeams.length > 0) {
      const advancingSlide = (
        <AdvancingTeamsSlide key="advancing" teams={advancingTeams} color={event.color} />
      );
      // Place advancement slide directly before champions award
      const advancingSlideIndex = awardSlides.findIndex(s => s.key === 'champions');
      awardSlides.splice(advancingSlideIndex, 0, advancingSlide);
    }

    return (
      <Box {...props}>
        <Deck
          initialState={initialState}
          onViewUpdate={onViewUpdate}
          ref={ref}
          enableReinitialize={enableReinitialize}
        >
          <ImageSlide src="/assets/audience-display/sponsors/first-in-show.svg" />
          <TitleSlide
            primary={`טקס סיום - ${event.name}`}
            secondary={dayjs(event.endDate).format('DD/MM/YYYY')}
          />
          {awardSlides}
          <TitleSlide primary="כל הכבוד לקבוצות!" secondary="להתראות בתחרות הארצית!" />
        </Deck>
      </Box>
    );
  }
);

AwardsPresentation.displayName = 'AwardsPresentation';

export default AwardsPresentation;
