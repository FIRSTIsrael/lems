import { useRouter } from 'next/router';
import { useState } from 'react';
import {
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Stack,
  MenuItem,
  Typography
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import 'dayjs/locale/he';
import dayjs, { Dayjs } from 'dayjs';
import { enqueueSnackbar } from 'notistack';
import { DivisionColor } from '@lems/types';
import { apiFetch } from '../../lib/utils/fetch';

const EventCreateForm: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs());
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [color, setColor] = useState<DivisionColor>('red');
  const router = useRouter();

  const createEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    apiFetch('/api/admin/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        startDate: startDate?.toDate(),
        endDate: endDate?.toDate(),
        color,
        hasState: false
      })
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw 'http-error';
        }
      })
      .then(data => router.push(`/admin/event/${data.id}`))
      .catch(() => enqueueSnackbar('אופס, לא הצלחנו ליצור את האירוע.', { variant: 'error' }));
  };

  return (
    <Paper
      component="form"
      onSubmit={createEvent}
      elevation={0}
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 2
      }}
    >
      <Stack direction="column" spacing={2}>
        <Typography variant="h2" align="center">
          צור אירוע
        </Typography>
        <TextField
          variant="outlined"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          label="שם אירוע"
          fullWidth
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="תאריך התחלה"
            value={startDate}
            onChange={newDate => setStartDate(newDate)}
            format="DD/MM/YYYY"
            slots={{
              textField: params => <TextField {...params} />
            }}
          />
          <DatePicker
            label="תאריך סיום"
            value={endDate}
            onChange={newDate => setEndDate(newDate)}
            format="DD/MM/YYYY"
            slots={{
              textField: params => <TextField {...params} />
            }}
          />
        </LocalizationProvider>
        <FormControl>
          <InputLabel id="event-color">צבע</InputLabel>
          <Select
            value={color}
            onChange={e => setColor(e.target.value as DivisionColor)}
            labelId="event-color"
            label="צבע"
          >
            {[
              { id: 'red', displayName: 'אדום' },
              { id: 'blue', displayName: 'כחול' }
            ].map((color: { id: string; displayName: string }) => {
              return (
                <MenuItem value={color.id} key={color.id}>
                  {color.displayName}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <Button type="submit" variant="contained">
          צור אירוע
        </Button>
      </Stack>
    </Paper>
  );
};

export default EventCreateForm;
