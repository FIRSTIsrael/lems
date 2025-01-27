import { useState, CSSProperties } from 'react';
import { WithId } from 'mongodb';
import dayjs, { Dayjs } from 'dayjs';
import { enqueueSnackbar } from 'notistack';
import { Box, Button, TextField, Typography, Stack, Paper, PaperProps } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { FllEvent } from '@lems/types';
import { apiFetch } from '../../lib/utils/fetch';
import ColorPickerButton from './color-picker-button';
import { DivisionSwatches } from '@lems/types';

interface EditEventFormProps extends PaperProps {
  event: WithId<FllEvent>;
}

const EditEventForm: React.FC<EditEventFormProps> = ({ event, ...props }) => {
  const [name, setName] = useState<string>(event.name);
  const [location, setLocation] = useState<string>(event.location);
  const [startDate, setStartDate] = useState<Dayjs>(dayjs(event.startDate));
  const [endDate, setEndDate] = useState<Dayjs>(dayjs(event.endDate));
  const gridItemSize = event.enableDivisions ? 4.5 : 4;
  const [color, setColor] = useState<CSSProperties['color']>(event.color);

  const updateEvent = () => {
    apiFetch(`/api/admin/events/${event._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        location,
        startDate: startDate.toDate() || event.startDate,
        endDate: endDate.toDate() || event.endDate
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
    <Paper {...props}>
      <Box
        component="form"
        onSubmit={e => {
          e.preventDefault();
          updateEvent();
        }}
      >
        <Stack direction="column" spacing={2}>
          <Typography variant="h2" fontSize="1.25rem" fontWeight={600}>
            פרטי האירוע
          </Typography>
          <Grid container spacing={2}>
            {!event.enableDivisions && (
              <Grid size={1.5}>
                <ColorPickerButton
                  fullWidth
                  swatches={DivisionSwatches}
                  value={color}
                  setColor={setColor}
                />
              </Grid>
            )}
            <Grid size={gridItemSize}>
              <TextField
                variant="outlined"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                label="שם אירוע"
                fullWidth
              />
            </Grid>
            <Grid size={gridItemSize}>
              <TextField
                variant="outlined"
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                label="מיקום האירוע"
                fullWidth
              />
            </Grid>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid size={gridItemSize}>
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
              <Grid size={gridItemSize}>
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
            <Button type="submit" variant="contained" sx={{ minWidth: 250 }}>
              שמירה
            </Button>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
};

export default EditEventForm;
