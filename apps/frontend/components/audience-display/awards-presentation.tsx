import { Ref, Fragment, forwardRef } from 'react';
import { WithId } from 'mongodb';
import { Event, Award } from '@lems/types';
import { Deck, Slide, Appear, DeckView, DeckRef } from '@lems/presentations';

interface AwardsPresentationProps {
  event: WithId<Event>;
  awards: Array<WithId<Award>>;
  callback: (view: DeckView) => void;
}

const AwardsPresentation = forwardRef<DeckRef, AwardsPresentationProps>(
  ({ event, awards, callback }, ref) => {
    const awardIndices = [...new Set(awards.flatMap(a => a.index))].sort((a, b) => a - b);

    return (
      <Deck
        initialState={{
          slideIndex: 0,
          stepIndex: 0
        }}
        callback={callback}
        ref={ref}
      >
        <Slide>
          <p>מצגת פרסים</p>
          <p>{event.name}</p>
        </Slide>
        {awardIndices.map(index => {
          const sortedAwards = awards
            .filter(a => a.index === index)
            .sort((a, b) => a.index - b.index);
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
                    {sortedAwards.length > 0 && <p>מקום {award.place}</p>}
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
    );
  }
);

AwardsPresentation.displayName = 'AwardsPresentation';

export default AwardsPresentation;
