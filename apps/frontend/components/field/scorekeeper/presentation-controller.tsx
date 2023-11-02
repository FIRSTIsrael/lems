import { Box, IconButton, Paper, Stack, Typography } from '@mui/material';
import EastRoundedIcon from '@mui/icons-material/EastRounded';
import WestRoundedIcon from '@mui/icons-material/WestRounded';
import { DeckRef } from '@lems/presentations';
import { useRef, useState } from 'react';
import { DeckView } from '@lems/presentations';
import AwardsPresentration from '../../audience-display/awards-presentation';
import { WithId } from 'mongodb';
import { Award, Event } from '@lems/types';

interface PresentationControllerProps {
  event: WithId<Event>;
  awards: Array<WithId<Award>>;
}

const PresentationController: React.FC<PresentationControllerProps> = ({ event, awards }) => {
  const [view, setView] = useState<DeckView>({
    slideIndex: 0,
    stepIndex: 0
  });

  const deck = useRef<DeckRef>(null);

  return (
    <Stack component={Paper} p={4} mt={2} justifyContent="center">
      <AwardsPresentration
        callback={setView}
        ref={deck}
        event={event}
        awards={awards}
        height={108 * 3}
        width={192 * 3}
        position="relative"
      />
      <Stack direction="row" spacing={4} justifyContent="center" alignItems="center">
        <IconButton onClick={deck.current?.stepForward}>
          <EastRoundedIcon fontSize="large" />
        </IconButton>
        <Typography>
          {view.slideIndex + 1} / {deck.current?.numberOfSlides}
        </Typography>
        <IconButton onClick={deck.current?.stepBackward}>
          <WestRoundedIcon fontSize="large" />
        </IconButton>
      </Stack>
    </Stack>
  );
};

export default PresentationController;
