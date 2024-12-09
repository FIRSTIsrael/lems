import { WithId } from 'mongodb';
import dayjs from 'dayjs';
import { Paper, Stack } from '@mui/material';
import { FllEvent, Division } from '@lems/types';
import GenerateScheduleButton from './generate-schedule';
import DeleteDivisionData from './delete-division-data';
import UploadFileButton from '../../components/general/upload-file';

interface DivisionScheduleEditorProps {
  event: WithId<FllEvent>;
  division: WithId<Division>;
}

const DivisionScheduleEditor: React.FC<DivisionScheduleEditorProps> = ({ event, division }) => {
  return (
    <Paper sx={{ p: 4 }}>
      <Stack justifyContent="center" direction="row" spacing={2}>
        {division?.hasState && <DeleteDivisionData division={{ ...division, event }} />}
        <UploadFileButton
          urlPath={`/api/admin/divisions/${division?._id}/schedule/parse`}
          displayName="לוח זמנים"
          extension=".csv"
          disabled={division?.hasState}
          requestData={{ timezone: dayjs.tz.guess() }}
        />
        <GenerateScheduleButton division={division} />
      </Stack>
    </Paper>
  );
};

export default DivisionScheduleEditor;
