import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import {
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Checkbox,
  FormControlLabel,
  Avatar,
  Box
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { enqueueSnackbar } from 'notistack';
import { DivisionColor } from '@lems/types';
import { apiFetch } from '../../../lib/utils/fetch';
import Layout from '../../../components/layout';
import Grid from '@mui/material/Unstable_Grid2';
import ImportIcon from '@mui/icons-material/UploadRounded';
import { TwitterPicker } from 'react-color';

const Page: NextPage = () => {
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [salesforceId, setSalesforceId] = useState<string>('');
  const [color, setColor] = useState<string>('#ff0000');
  const [showPicker, setShowPicker] = useState<boolean>(false);

  const availableColors = [
    '#DF1125',
    '#F12E6D',
    '#1EA5FC',
    '#87B9E7',
    '#FFDA3A',
    '#F7F6AF',
    '#80E220',
    '#CFF1D6',
    '#8962F8',
    '#A990DD'
  ];

  const resetTimePart = (date: Dayjs): Dayjs =>
    date.set('hours', 0).set('minutes', 0).set('seconds', 0).set('milliseconds', 0);

  const getDefaultDate = () => {
    return dayjs();
  };

  const [startDate, setStartDate] = useState<Dayjs | null>(getDefaultDate());
  const [endDate, setEndDate] = useState<Dayjs | null>(getDefaultDate());

  const createDivision = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    apiFetch('/api/admin/divisions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        salesforceId,
        startDate: resetTimePart(startDate || getDefaultDate())
          .tz('utc', true)
          .toDate(),
        endDate: resetTimePart(endDate || getDefaultDate())
          .tz('utc', true)
          .toDate(),
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
      .then(data => router.push(`/admin/division/${data.id}`))
      .catch(() => enqueueSnackbar('אופס, לא הצלחנו ליצור את האירוע.', { variant: 'error' }));
  };

  return (
    <Layout maxWidth="xl" title="יצירת אירוע">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Grid component={Paper} container rowGap={3} columnSpacing={3} p={2} mt={2}>
          <Grid xs={12}>
            <Typography variant="h2">הגדרות כלליות</Typography>
          </Grid>
          <Grid xs={4}>
            <TextField
              variant="outlined"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              label="שם אירוע"
              fullWidth
            />
          </Grid>
          <Grid xs={4}>
            <DatePicker
              label="תאריך התחלה"
              value={startDate}
              onChange={newDate => {
                setStartDate(newDate);
                setEndDate(newDate);
              }}
              format="DD/MM/YYYY"
              sx={{ width: '100%' }}
            />
          </Grid>
          <Grid xs={4}>
            <DatePicker
              label="תאריך סיום"
              value={endDate}
              onChange={newDate => setEndDate(newDate)}
              format="DD/MM/YYYY"
              readOnly
              sx={{ width: '100%' }}
            />
          </Grid>
          <Grid xs={4}>
            <Button variant="contained" startIcon={<ImportIcon />} disabled size="large" fullWidth>
              העלאת רשימת קבוצות
            </Button>
          </Grid>
          <Grid xs={12}>
            <Typography variant="h2">הגדרות אינטגרציה</Typography>
          </Grid>
          <Grid container alignItems="center" xs={4} spacing={2}>
            <Grid xs={2}>
              <Avatar
                src="/assets/first-israel-vertical.png"
                alt="לוגו של פירסט ישראל"
                sx={{ bgcolor: grey[100], width: 56, height: 56 }}
              />
            </Grid>
            <Grid xs={4}>
              <Typography>
                ה-Dashboard של <em>FIRST</em> ישראל
              </Typography>
            </Grid>
            <Grid xs={2}>
              <FormControlLabel control={<Checkbox disabled checked />} label="פעיל" />
            </Grid>
            <Grid xs={4}>
              <TextField
                variant="outlined"
                type="text"
                value={salesforceId}
                onChange={e => setSalesforceId(e.target.value)}
                label="מזהה אירוע"
              />
            </Grid>
          </Grid>
          <Grid xs={12}>
            <Typography variant="h2">הגדרות בתים</Typography>
          </Grid>
          <Grid container alignItems="center" xs={6} spacing={2}>
            <Grid xs={1.5} position="relative" height="100%">
              <Button
                sx={{
                  backgroundColor: color,
                  borderRadius: '1rem',
                  height: '100%',
                  '&:hover': {
                    backgroundColor: color + '7a'
                  }
                }}
                fullWidth
                onClick={() => setShowPicker(true)}
              />
              {showPicker && (
                <div style={{ position: 'absolute', zIndex: 5 }}>
                  <div
                    style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }}
                    onClick={() => setShowPicker(false)}
                  />
                  <div style={{ marginTop: 10 }} />
                  <TwitterPicker
                    color={color}
                    onChangeComplete={(newColor, e) => {
                      if (e.type === 'click' || e.target.value.length === 6) {
                        setColor(newColor.hex);
                        setShowPicker(false);
                      }
                    }}
                    colors={availableColors}
                    triangle="top-right"
                  />
                </div>
              )}
            </Grid>
            <Grid xs={10.5}>
              <TextField variant="outlined" type="text" label="שם בית" fullWidth />
            </Grid>
          </Grid>
          <Grid xs={12}>
            <Button type="submit" variant="contained">
              צור אירוע
            </Button>
          </Grid>
        </Grid>
      </LocalizationProvider>
    </Layout>
  );
};

// export const getServerSideProps: GetServerSideProps = async () => {
// };

export default Page;
