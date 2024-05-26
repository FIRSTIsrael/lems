import { useState, CSSProperties } from 'react';
import { WithId } from 'mongodb';
import dayjs, { Dayjs } from 'dayjs';
import { enqueueSnackbar } from 'notistack';
import {
  Box,
  Button,
  ButtonProps,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Stack,
  Paper
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Grid from '@mui/material/Unstable_Grid2';
import { Division, DivisionSwatches } from '@lems/types';
import { apiFetch } from '../../lib/utils/fetch';
import ColorPickerButton from './color-picker-button';

interface EditDivisionFormProps extends ButtonProps {
  division: WithId<Division>;
}

const EditDivisionForm: React.FC<EditDivisionFormProps> = ({ division, onSubmit }) => {
  const [name, setName] = useState<string>(division.name);
  const [startDate, setStartDate] = useState<Dayjs>(dayjs(division.startDate));
  const [endDate, setEndDate] = useState<Dayjs>(dayjs(division.endDate));
  const [color, setColor] = useState<CSSProperties['color']>(division.color);

  const updateDivision = () => {
    apiFetch(`/api/admin/divisions/${division._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        startDate: startDate.toDate() || division.startDate,
        endDate: endDate.toDate() || division.endDate,
        color
      })
    }).then(res => {
      if (res.ok) {
        enqueueSnackbar('פרטי האירוע נשמרו בהצלחה!', { variant: 'success' });
      } else {
        enqueueSnackbar('אופס, שמירת פרטי האירוע נכשלה.', { variant: 'error' });
      }
    });
  };

  return (
    <Paper sx={{ p: 4 }}>
      <Box
        component="form"
        onSubmit={e => {
          e.preventDefault();
          updateDivision();
        }}
      >
        <Stack direction="column" spacing={2}>
          <Typography variant="h2" fontSize="1.25rem" fontWeight={600}>
            פרטי האירוע
          </Typography>
          <Grid container spacing={2}>
            <Grid xs={6}>
              <TextField
                variant="outlined"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                label="שם אירוע"
                fullWidth
              />
            </Grid>
            <Grid xs={6}>
              <ColorPickerButton
                swatches={DivisionSwatches}
                value={color}
                setColor={setColor}
                fullWidth
              />
            </Grid>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid xs={6}>
                <DatePicker
                  disabled // Currently we do not support editing division dates (see LEMS-153)
                  label="תאריך התחלה"
                  value={startDate}
                  onChange={newDate => {
                    if (newDate) setStartDate(newDate);
                  }}
                  format="DD/MM/YYYY"
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid xs={6}>
                <DatePicker
                  disabled // Currently we do not support editing division dates (see LEMS-153)
                  label="תאריך סיום"
                  value={endDate}
                  onChange={newDate => {
                    if (newDate) setEndDate(newDate);
                  }}
                  format="DD/MM/YYYY"
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
            </LocalizationProvider>
          </Grid>

          <Box justifyContent="center" display="flex">
            <Button type="submit" variant="contained" sx={{ minWidth: 100 }}>
              שמירה
            </Button>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
};

export default EditDivisionForm;
