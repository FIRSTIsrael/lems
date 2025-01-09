import { WithId } from 'mongodb';
import { Division } from '@lems/types';

interface TimingStepProps {
  division: WithId<Division>;
}

const TimingStep: React.FC<TimingStepProps> = ({ division }) => {
  return (
    <>
      <p>Do something here</p>
    </>
  );
};

export default TimingStep;
