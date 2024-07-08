import React, { Fragment, forwardRef, useMemo, useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { WithId } from 'mongodb';
import { Box, BoxProps } from '@mui/material';
import { Division, Award, Team } from '@lems/types';
import { localizedAward } from '@lems/season';
import { Deck, DeckView, DeckRef } from '@lems/presentations';
import TitleSlide from './title-slide';
import ImageSlide from './image-slide';
import AwardWinnerChromaSlide from './award-winner-chroma-slide';
import AwardWinnerSlide from './award-winner-slide';
import AdvancingTeamsSlide from './advancing-teams-slide';
import { apiFetch } from '../../lib/utils/fetch';

interface AwardsPresentationProps extends BoxProps {
  division: WithId<Division>;
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
    const [teams, setTeams] = useState<Array<WithId<Team>>>([]);
    const [awards, setAwards] = useState<Array<WithId<Award>>>([]);

    useEffect(() => {
      apiFetch(`/api/divisions/${division._id}/awards`).then(res =>
        res.json().then(data => setAwards(data))
      );
      apiFetch(`/api/divisions/${division._id}/teams`).then(res =>
        res.json().then(data => setTeams(data))
      );
    }, [division._id]);

    const advancingTeams = useMemo(() => teams.filter(t => t.advancing), [teams]);
    const awardSlides = useMemo(() => {
      const awardIndices = [...new Set(awards.flatMap(a => a.index))].sort((a, b) => a - b);

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
          <TitleSlide primary={`טקס סיום - ${division.name}`} color={division.color} />
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
