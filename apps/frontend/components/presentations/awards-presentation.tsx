import React, { Fragment, forwardRef, useMemo, useState, useEffect } from 'react';
import { WithId } from 'mongodb';
import { Box, BoxProps } from '@mui/material';
import { Award, Team, DivisionWithEvent } from '@lems/types';
import { localizedAward } from '@lems/season';
import { Deck, DeckView, DeckRef } from '@lems/presentations';
import TitleSlide from './title-slide';
import ImageSlide from './image-slide';
import AwardWinnerChromaSlide from './award-winner-chroma-slide';
import AwardWinnerSlide from './award-winner-slide';
import AdvancingTeamsSlide from './advancing-teams-slide';
import { apiFetch } from '../../lib/utils/fetch';
import { localizeDivisionTitle } from '../../localization/event';

interface AwardsPresentationProps extends BoxProps {
  division: WithId<DivisionWithEvent>;
  initialState?: DeckView;
  onViewUpdate?: (activeView: DeckView) => void;
  enableReinitialize?: boolean;
  awardWinnerSlideStyle?: 'chroma' | 'full' | 'both';
}

const AwardsPresentation = forwardRef<DeckRef, AwardsPresentationProps>(
  (
    {
      division,
      initialState = {
        slideIndex: 0,
        stepIndex: 0
      },
      onViewUpdate,
      enableReinitialize,
      awardWinnerSlideStyle = 'both',
      ...props
    },
    ref
  ) => {
    const [awards, setAwards] = useState<Array<WithId<Award>>>([]);

    useEffect(() => {
      apiFetch(`/api/divisions/${division._id}/awards`).then(res =>
        res.json().then(data => setAwards(data))
      );
    }, [division._id]);

    const advancingTeams = awards
      .filter(award => award.name === 'advancement')
      .map(award => award.winner) as Array<WithId<Team>>;
    const awardSlides = useMemo(() => {
      const awardIndices = [
        ...new Set(awards.filter(award => award.index > 0).flatMap(a => a.index))
      ].sort((a, b) => a - b);

      const slides = awardIndices.map(index => {
        const sortedAwards = awards
          .filter(a => a.index === index)
          .sort((a, b) => b.place - a.place);
        const { name: awardName } = sortedAwards[0];
        const localized = localizedAward[awardName];

        return (
          <Fragment key={awardName}>
            <TitleSlide primary={`פרס ${localized.name}`} color={division.color} />
            <TitleSlide
              primary={`פרס ${localized.name}`}
              secondary={localized.description}
              color={division.color}
            />
            {sortedAwards.map(award => {
              return (
                <React.Fragment key={award.place}>
                  {['chroma', 'both'].includes(awardWinnerSlideStyle) && (
                    <AwardWinnerChromaSlide
                      name={`פרס ${localized.name}`}
                      place={sortedAwards.length > 1 ? award.place : undefined}
                      winner={award.winner || ''}
                      color={division.color}
                    />
                  )}
                  {['full', 'both'].includes(awardWinnerSlideStyle) && (
                    <AwardWinnerSlide
                      name={`פרס ${localized.name}`}
                      place={sortedAwards.length > 1 ? award.place : undefined}
                      winner={award.winner || ''}
                      color={division.color}
                      hideWinner={awardWinnerSlideStyle === 'full'}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </Fragment>
        );
      });

      if (advancingTeams.length > 0) {
        const advancingSlide = (
          <AdvancingTeamsSlide key="advancing" teams={advancingTeams} color={division.color} />
        );
        // Place advancement slide directly before champions award
        const advancingSlideIndex = slides.findIndex(s => s.key === 'champions');
        slides.splice(advancingSlideIndex, 0, advancingSlide);
      }

      return slides;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [advancingTeams, awards, division.color]);

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
            primary={`טקס סיום - ${localizeDivisionTitle(division)}`}
            color={division.color}
          />
          {awardSlides}
          <TitleSlide
            primary="כל הכבוד לקבוצות!"
            secondary="להתראות בעונות הבאות!"
            color={division.color}
          />
        </Deck>
      </Box>
    );
  }
);

AwardsPresentation.displayName = 'AwardsPresentation';

export default AwardsPresentation;
