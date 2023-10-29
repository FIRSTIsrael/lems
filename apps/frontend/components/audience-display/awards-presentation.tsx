import { Presentation, Slide, Appear } from '@lems/presentations';

const AwardsPresentation: React.FC = () => {
  return (
    <Presentation>
      <Slide>
        <Appear>
          <p>meep</p>
        </Appear>
      </Slide>
      <Slide></Slide>
    </Presentation>
  );
};

export default AwardsPresentation;
