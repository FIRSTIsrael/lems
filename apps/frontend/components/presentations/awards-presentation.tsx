import { Fragment, forwardRef } from 'react';
import { WithId } from 'mongodb';
import { Box, BoxProps } from '@mui/material';
import { Event, Award } from '@lems/types';
import { Deck, DeckView, DeckRef } from '@lems/presentations';
import TitleSlide from './title-slide';
import dayjs from 'dayjs';
import ImageSlide from './image-slide';
import { localizedAward } from '@lems/season';
import AwardWinnerSlide from './award-winner-slide';

interface AwardsPresentationProps extends BoxProps {
  event: WithId<Event>;
  awards: Array<WithId<Award>>;
  initialState?: DeckView;
  onViewUpdate?: (activeView: DeckView) => void;
  enableReinitialize?: boolean;
}

const AwardsPresentation = forwardRef<DeckRef, AwardsPresentationProps>(
  (
    {
      event,
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
          {awardIndices.map(index => {
            const sortedAwards = awards
              .filter(a => a.index === index)
              .sort((a, b) => b.place - a.place);
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
                    />
                  );
                })}
              </Fragment>
            );
          })}
          <TitleSlide primary="כל הכבוד לקבוצות!" secondary="להתראות בתחרות הארצית!" />
        </Deck>
      </Box>
    );
  }
);

AwardsPresentation.displayName = 'AwardsPresentation';

export default AwardsPresentation;
