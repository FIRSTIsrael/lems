import { WithId } from 'mongodb';
import { Paper, Stack } from '@mui/material';
import { FllEvent, Division } from '@lems/types';
import DeleteDivisionData from './delete-division-data';
import GenerateScheduleForm from './schedule-generator/generate-schedule-form';

interface DivisionScheduleEditorProps {
  event: WithId<FllEvent>;
  division: WithId<Division>;
}

const DivisionScheduleEditor: React.FC<DivisionScheduleEditorProps> = ({ event, division }) => {
  return (
    <Paper sx={{ p: 4 }}>
      <Stack justifyContent="center" direction="row" spacing={2}>
        {division?.hasState && <DeleteDivisionData division={{ ...division, event }} />}
        <GenerateScheduleForm division={division} />
      </Stack>
    </Paper>
  );
};

export default DivisionScheduleEditor;
