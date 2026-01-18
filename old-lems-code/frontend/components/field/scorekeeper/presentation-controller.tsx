/* eslint-disable react-hooks/refs */
/* TODO: Fix the render methods of this file to not access refs during render!! */

'use client';

import React, { ReactElement, useRef, useState } from 'react';
import { WithId } from 'mongodb';
import { Socket } from 'socket.io-client';
import { enqueueSnackbar } from 'notistack';
import { IconButton, Paper, Stack, Typography } from '@mui/material';
import EastRoundedIcon from '@mui/icons-material/EastRounded';
import WestRoundedIcon from '@mui/icons-material/WestRounded';
import { DeckRef, DeckView, GOTO_FINAL_STEP } from '@lems/presentations';
import { Division, DivisionState, WSServerEmittedEvents, WSClientEmittedEvents } from '@lems/types';

interface PresentationControllerProps {
  division: WithId<Division>;
  divisionState: WithId<DivisionState>;
  presentationId: string;
  children: ReactElement<unknown>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

export const PresentationController: React.FC<PresentationControllerProps> = ({
  division,
  divisionState,
  presentationId,
  children,
  socket
}) => {
  const deck = useRef<DeckRef>(null);
  const previewDeck = useRef<DeckRef>(null);
  const [showFinalSlide, setShowFinalSlide] = useState(true);

  // Consider making this show 1 step ahead instead of 1 slide ahead
  const endOfNextSlide = ({ slideIndex }: DeckView) => ({
    slideIndex: slideIndex + 1,
    stepIndex: GOTO_FINAL_STEP
  });

  const sendSlideUpdate = (newView: DeckView) => {
    setShowFinalSlide(
      (deck.current?.numberOfSlides || 0) - 1 !== deck?.current?.activeView.slideIndex
    );
    previewDeck.current?.skipTo(endOfNextSlide(newView));

    socket.emit(
      'updatePresentation',
      division._id.toString(),
      presentationId,
      { activeView: newView },
      response => {
        if (!response.ok) {
          enqueueSnackbar('אופס, לא הצלחנו לעדכן את המצגת.', { variant: 'error' });
        }
      }
    );
  };

  // Note that only one of these components can be used at a time without conflicts.
  // This can be solved by using enableReinitialize=true on both decks
  // However that leads to circular updates when a desync happens.
  return (
    <Stack component={Paper} p={4} mt={2} justifyContent="center">
      <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
        <Stack spacing={2}>
          <Typography textAlign="center">שקף נוכחי</Typography>
          {React.Children.map(children, child => {
            return React.cloneElement(child, {
              initialState: divisionState.presentations[presentationId].activeView,
              onViewUpdate: sendSlideUpdate,
              ref: deck
            });
          })}
        </Stack>
        {showFinalSlide && (
          <Stack spacing={2}>
            <Typography textAlign="center">שקף הבא</Typography>
            {React.Children.map(children, child => {
              if (deck.current)
                return React.cloneElement(child, {
                  enableReinitialize: true,
                  initialState: endOfNextSlide(deck.current.activeView),
                  ref: previewDeck
                });
            })}
          </Stack>
        )}
      </Stack>
      <Stack direction="row" spacing={4} justifyContent="center" alignItems="center">
        <IconButton onClick={deck.current?.stepBackward}>
          <EastRoundedIcon fontSize="large" />
        </IconButton>
        <Typography>
          {deck.current?.numberOfSlides} / {(deck.current?.activeView.slideIndex || 0) + 1}
        </Typography>
        <IconButton onClick={deck.current?.stepForward}>
          <WestRoundedIcon fontSize="large" />
        </IconButton>
      </Stack>
    </Stack>
  );
};
