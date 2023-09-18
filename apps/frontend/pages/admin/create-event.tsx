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
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';
import { apiFetch } from "../../lib/utils/fetch";
import { useRouter } from "next/router";

const Page = () => {
  const [eventId, setEventId] = useState('');
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs());
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [color, setColor] = useState('red');
  const router = useRouter();

  const createEvent = () =>
  {
    apiFetch('/api/admin/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: eventId,
        name,
        startDate: startDate?.toDate(),
        endDate: endDate?.toDate(),
        color
      })
    })
      .then(res => res.json())
      .then(({ id }) => router.back());
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
          value={eventId}
          onChange={(e: any) => setEventId(e.target.value)}
          label="מזהה אירוע"
          fullWidth
        />
        <TextField
          variant="outlined"
          type="text"
          value={name}
          onChange={(e: any) => setName(e.target.value)}
          label="שם אירוע"
          fullWidth
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="תאריך התחלה"
            value={startDate}
            onChange={newDate => setStartDate(newDate)}
            renderInput={(params: any) => <TextField {...params} />}
          />
          <DatePicker
            label="תאריך סיום"
            value={endDate}
            onChange={newDate => setEndDate(newDate)}
            renderInput={(params: any) => <TextField {...params} />}
          />
        </LocalizationProvider>
        <FormControl>
          <InputLabel id="event-color">צבע</InputLabel>
          <Select
            value={color}
            onChange={(e: any) => setColor(e.target.value)}
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

export default Page;
