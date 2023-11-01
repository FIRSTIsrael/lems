import { Deck, Slide, Appear } from '@lems/presentations';

const AwardsPresentation: React.FC = () => {
  return (
    <Deck
      initialState={{
        slideIndex: 0,
        stepIndex: 0
      }}
    >
      <Slide>
        <p>slide1step1</p>
        <Appear>
          <p>slide1step2</p>
        </Appear>
      </Slide>
      <Slide>
        <p>slide2step1</p>
      </Slide>
    </Deck>
  );
};

export default AwardsPresentation;
