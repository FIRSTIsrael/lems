import { WithId } from 'mongodb';
import { Stack } from '@mui/material';
import { Division } from '@lems/types';
import FormikTimePicker from '../../general/forms/formik-time-picker';

interface TimingStepProps {
  division: WithId<Division>;
}

const TimingStep: React.FC<TimingStepProps> = ({ division }) => {
  return (
    <Stack spacing={2} direction="row">
      <FormikTimePicker name="matchesStart" label="תחילת מקצים" />
      <FormikTimePicker name="judgingStart" label="תחילת שיפוט" />
    </Stack>
  );
};

export default TimingStep;
