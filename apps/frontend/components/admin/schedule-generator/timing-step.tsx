import { WithId } from 'mongodb';
import { FormLabel, IconButton, Stack, TextField, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { Division } from '@lems/types';
import FormikTimePicker from '../../general/forms/formik-time-picker';
import FormikRadioGroup from '../../general/forms/formik-radio-group';
import FormikNumberInput from '../../general/forms/formik-number-input';
import { isBreakStatement } from 'typescript';

export interface Break { //TODO: move?
  eventType: 'match' | 'judging';
  after: number;
  durationSeconds: number;
}

interface TimingStepProps {
  division: WithId<Division>;
  judgingStart: Date;
  setJudgingStart: (time: Date) => void;
  matchesStart: Date;
  setMatchesStart: (time: Date) => void;
  breaks: Array<Break>;
  setBreaks: (breaks: Array<Break>) => void;
}

const TimingStep: React.FC<TimingStepProps> = ({
  division,
  judgingStart,
  setJudgingStart,
  matchesStart,
  setMatchesStart,
  breaks,
  setBreaks
}) => {

  // const addBreak = (break: Break) => {
  //   setBreaks([...breaks, break])
  // };

  return (
    <Stack spacing={2}>
      <Stack spacing={2} direction="row">
        <FormikTimePicker name="matchesStart" label="תחילת מקצים" />
        <FormikTimePicker name="judgingStart" label="תחילת שיפוט" />
      </Stack>
      <Typography variant="h6">הפסקות</Typography>
      <Stack direction="row" spacing={2}>
        <FormikRadioGroup
          name="breaktype"
          label="סוג הפסקה"
          options={[
            { value: "match", label: "זירה" },
            { value: "judging", label: "שיפוט" }
          ]}>
        </FormikRadioGroup>
        <Stack direction="column" spacing={2}>
          <FormLabel component="legend">לאחר איזה סיבוב</FormLabel>
          <FormikNumberInput name="after" min={1} />
        </Stack>
        <Stack direction="column" spacing={2}>
          <FormLabel component="legend">אורך ההפסקה בדקות</FormLabel>
          <FormikTimePicker name="breakLength" format="mm:ss" views={["minutes", "seconds"]} />
        </Stack>
        <IconButton
          sx={{ ml: 2 }}
          onClick={() => { }}
        >
          <AddRoundedIcon />
        </IconButton>
        {breaks.map(({ eventType, after, durationSeconds }) => (
          <Typography variant="body1">{`הפסקה ב${eventType} לאחר מקצה ${after} באורך ${durationSeconds} דקות`}</Typography> //TODO: format the time
        ))}
      </Stack>
    </Stack>
  );
};

export default TimingStep;
