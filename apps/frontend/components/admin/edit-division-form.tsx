import { useState, CSSProperties } from 'react';
import { WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import dayjs from 'dayjs';
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Paper,
  PaperProps,
  Divider
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { FllEvent, Division, DivisionSwatches } from '@lems/types';
import { apiFetch } from '../../lib/utils/fetch';
import ColorPickerButton from './color-picker-button';
import UploadFileButton from '../general/upload-file';
import DownloadUsersButton from './download-users';

interface EditDivisionFormProps extends PaperProps {
  event: WithId<FllEvent>;
  division: WithId<Division>;
}

const EditDivisionForm: React.FC<EditDivisionFormProps> = ({ event, division, ...props }) => {
  const [name, setName] = useState<string>(division.name);
  const [color, setColor] = useState<CSSProperties['color']>(division.color);

  const updateDivision = () => {
    apiFetch(`/api/admin/divisions/${division._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color })
    }).then(res => {
      if (res.ok) {
        enqueueSnackbar('פרטי הבית נשמרו בהצלחה!', { variant: 'success' });
      } else {
        enqueueSnackbar('אופס, שמירת פרטי הבית נכשלה.', { variant: 'error' });
      }
    });
  };

  return (
    <Paper sx={{ p: 4 }} {...props}>
      <Box
        component="form"
        onSubmit={e => {
          e.preventDefault();
          updateDivision();
        }}
      >
        <Stack direction="column" spacing={2}>
          <Typography variant="h2" fontSize="1.25rem" fontWeight={600}>
            פרטי הבית
          </Typography>
          <Grid container spacing={2}>
            <Grid size={6}>
              <TextField
                variant="outlined"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                label="שם בית"
                fullWidth
              />
            </Grid>
            <Grid size={6}>
              <ColorPickerButton
                swatches={DivisionSwatches}
                value={color}
                setColor={setColor}
                fullWidth
              />
            </Grid>
          </Grid>
          <Box justifyContent="center" display="flex">
            <Button type="submit" variant="contained" sx={{ minWidth: 100 }}>
              שמירה
            </Button>
          </Box>
          <Divider />
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
            <UploadFileButton
              urlPath={`/api/admin/divisions/${division._id}/schedule/parse`}
              displayName="לוח זמנים"
              extension=".csv"
              disabled={division.hasState}
              requestData={{ timezone: dayjs.tz.guess() }}
            />
            <UploadFileButton
              urlPath={`/api/admin/divisions/${division._id}/pit-map`}
              displayName="מפת פיטים"
              extension=".png"
            />
            <DownloadUsersButton division={division} disabled={!division.hasState} />
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
};

export default EditDivisionForm;
