import { Presentation, Slide, Appear } from '@lems/presentations';

const AwardsPresentation: React.FC = () => {
  return (
    <Presentation>
      <Slide>
        <Appear>
          <p>meep</p>
        </Appear>
      </Slide>
      <Slide>
        <p>peem</p>
      </Slide>
    </Presentation>
  );
};

export default AwardsPresentation;
