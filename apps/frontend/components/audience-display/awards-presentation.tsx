import { Fragment, forwardRef } from 'react';
import { WithId } from 'mongodb';
import { Event, Award } from '@lems/types';
import { Box, BoxProps } from '@mui/material';
import { Deck, Slide, Appear, DeckView, DeckRef } from '@lems/presentations';
import TitleSlide from './title-slide';

interface AwardsPresentationProps extends BoxProps {
  event: WithId<Event>;
  awards: Array<WithId<Award>>;
  callback?: (view: DeckView) => void;
}

const AwardsPresentation = forwardRef<DeckRef, AwardsPresentationProps>(
  ({ event, awards, callback, ...props }, ref) => {
    const awardIndices = [...new Set(awards.flatMap(a => a.index))].sort((a, b) => a - b);

    return (
      <Box {...props}>
        <Deck
          initialState={{
            slideIndex: 0,
            stepIndex: 0
          }}
          callback={callback}
          ref={ref}
        >
          <Slide>
            <TitleSlide primary="מצגת פרסים" secondary={event.name} />
          </Slide>
          {awardIndices.map(index => {
            const sortedAwards = awards
              .filter(a => a.index === index)
              .sort((a, b) => b.place - a.place);
            const { name: awardName } = sortedAwards[0];

            return (
              <Fragment key={awardName}>
                <Slide>
                  <p>פרס {awardName}</p>
                </Slide>
                <Slide>
                  <p>תיאור פרס {awardName}</p>
                </Slide>
                {sortedAwards.map(award => {
                  return (
                    <Slide key={award.place}>
                      <p>פרס {award.name}</p>
                      {sortedAwards.length > 1 && <p>מקום {award.place}</p>}
                      <Appear>
                        <p>{JSON.stringify(award.winner)}</p>
                      </Appear>
                    </Slide>
                  );
                })}
              </Fragment>
            );
          })}
          <Slide>
            <p>תודה לכולם!</p>
            <p>נתראה בארצית!</p>
          </Slide>
        </Deck>
      </Box>
    );
  }
);

AwardsPresentation.displayName = 'AwardsPresentation';

export default AwardsPresentation;
