import React, { ReactElement, useRef, useState } from 'react';
import { WithId } from 'mongodb';
import { Socket } from 'socket.io-client';
import { enqueueSnackbar } from 'notistack';
import { IconButton, Paper, Stack, Typography } from '@mui/material';
import EastRoundedIcon from '@mui/icons-material/EastRounded';
import WestRoundedIcon from '@mui/icons-material/WestRounded';
import { DeckRef, DeckView, GOTO_FINAL_STEP } from '@lems/presentations';
import { Event, EventState, WSServerEmittedEvents, WSClientEmittedEvents } from '@lems/types';

interface PresentationControllerProps {
  event: WithId<Event>;
  eventState: WithId<EventState>;
  presentationId: string;
  children: ReactElement;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const PresentationController: React.FC<PresentationControllerProps> = ({
  event,
  eventState,
  presentationId,
  children,
  socket
}) => {
  const deck = useRef<DeckRef>(null);
  const previewDeck = useRef<DeckRef>(null);
  const [showFinalSlide, setShowFinalSlide] = useState(true);

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
      event._id.toString(),
      presentationId,
      { activeView: newView },
      response => {
        if (!response.ok) {
          enqueueSnackbar('אופס, לא הצלחנו לעדכן את המצגת.', { variant: 'error' });
        }
      }
    );
  };

  return (
    <Stack component={Paper} p={4} mt={2} justifyContent="center">
      <Stack direction="row" spacing={2}>
        {React.Children.map(children, child => {
          return React.cloneElement(child, {
            initialState: eventState.presentations[presentationId].activeView,
            onViewUpdate: sendSlideUpdate,
            ref: deck
          });
        })}
        {showFinalSlide &&
          React.Children.map(children, child => {
            if (deck.current)
              return React.cloneElement(child, {
                initialState: endOfNextSlide(deck.current.activeView),
                ref: previewDeck
              });
          })}
      </Stack>
      <Stack direction="row" spacing={4} justifyContent="center" alignItems="center">
        <IconButton onClick={deck.current?.stepForward}>
          <EastRoundedIcon fontSize="large" />
        </IconButton>
        <Typography>
          {(deck.current?.activeView.slideIndex || 0) + 1} / {deck.current?.numberOfSlides}
        </Typography>
        <IconButton onClick={deck.current?.stepBackward}>
          <WestRoundedIcon fontSize="large" />
        </IconButton>
      </Stack>
    </Stack>
  );
};

export default PresentationController;
