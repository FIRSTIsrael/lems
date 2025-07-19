import { useState, useEffect, SetStateAction } from 'react';
import { WithId } from 'mongodb';
import { Division, JudgingRoom, RobotGameTable, ScheduleGenerationSettings } from '@lems/types';
import {
  Button,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import Grid from '@mui/material/Grid';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { apiFetch } from '../../../lib/utils/fetch';
import { NumberInput } from '@lems/shared';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { heIL } from '@mui/x-date-pickers/locales';

interface LocationManagerProps {
  locations: string[];
  setLocations: React.Dispatch<SetStateAction<string[]>>;
  title: string;
}

const LocationManager: React.FC<LocationManagerProps> = ({ locations, setLocations, title }) => {
  const addLocation = () => {
    setLocations(prev => [...prev, '']);
  };

  const removeLocation = (index: number) => {
    setLocations(prev => {
      const newLocations = [...prev];
      newLocations.splice(index, 1);
      return newLocations;
    });
  };

  return (
    <Grid size={4}>
      <Stack direction="row" spacing={2} alignItems="center" marginBottom={4}>
        <Typography fontSize="1.5rem" fontWeight={500}>
          {title}
        </Typography>
        <IconButton onClick={addLocation} size="small">
          <AddRoundedIcon />
        </IconButton>
      </Stack>
      <Stack spacing={3}>
        {locations.map((location, index) => (
          <Grid container key={`title-${index}`} spacing={2} alignItems="center" width="80%">
            <Grid size={2}>
              <Typography>{index + 1}</Typography>
            </Grid>
            <Grid size={8}>
              <TextField
                defaultValue={location}
                variant="standard"
                onBlur={e => {
                  const newValue = e.target.value;
                  setLocations(prev => {
                    const newRooms = [...prev];
                    newRooms[index] = newValue;
                    return newRooms;
                  });
                }}
              />
            </Grid>
            <Grid size={2}>
              <IconButton onClick={() => removeLocation(index)} size="small">
                <DeleteRoundedIcon />
              </IconButton>
            </Grid>
          </Grid>
        ))}
      </Stack>
    </Grid>
  );
};

interface VenueSetupStepProps {
  division: WithId<Division>;
  settings: ScheduleGenerationSettings;
  updateSettings: (settings: ScheduleGenerationSettings) => void;
  advanceStep(): void;
  goBack(): void;
}

const VenueSetupStep: React.FC<VenueSetupStepProps> = ({
  division,
  settings,
  updateSettings,
  advanceStep,
  goBack
}) => {
  const [rooms, setRooms] = useState<Array<string>>([]);
  const [tables, setTables] = useState<Array<string>>([]);

  const canAdvanceStep =
    rooms.length > 0 &&
    tables.length > 0 &&
    settings.practiceCycleTimeSeconds &&
    settings.rankingCycleTimeSeconds &&
    settings.judgingCycleTimeSeconds;

  const fetchRooms = async () => {
    const response = await apiFetch(`/api/divisions/${division._id}/rooms`);
    const data = await response.json();
    setRooms(data.map((room: WithId<JudgingRoom>) => room.name));
  };

  const createRooms = async (rooms: string[]) => {
    const response = await apiFetch(`/api/divisions/${division._id}/rooms`, {
      method: 'POST',
      body: JSON.stringify({ names: rooms }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    setRooms(data.map((room: JudgingRoom) => room.name));
  };

  const fetchTables = async () => {
    const response = await apiFetch(`/api/divisions/${division._id}/tables`);
    const data = await response.json();
    setTables(data.map((table: WithId<RobotGameTable>) => table.name));
  };

  const createTables = async (tables: string[]) => {
    const response = await apiFetch(`/api/divisions/${division._id}/tables`, {
      method: 'POST',
      body: JSON.stringify({ names: tables }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    setTables(data.map((table: RobotGameTable) => table.name));
  };

  useEffect(() => {
    fetchRooms();
    fetchTables();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      localeText={heIL.components.MuiLocalizationProvider.defaultProps.localeText}
    >
      <Grid container spacing={2} marginBottom={4}>
        <Grid size={4}>
          <Stack spacing={3}>
            <Stack spacing={1}>
              <Typography fontSize="1.5rem" fontWeight={500}>
                הגדרות
              </Typography>
              <Typography>מספר סבבי אימונים</Typography>
              <NumberInput
                min={1}
                max={5}
                value={settings.practiceRounds}
                onChange={(e, value) => {
                  if (value !== null) {
                    e.preventDefault();
                    updateSettings({ ...settings, practiceRounds: value });
                  }
                }}
              />
            </Stack>
            <Stack spacing={1}>
              <Typography>מספר סבבי דירוג</Typography>
              <NumberInput
                min={1}
                max={5}
                value={settings.rankingRounds}
                onChange={(e, value) => {
                  if (value !== null) {
                    e.preventDefault();
                    updateSettings({ ...settings, rankingRounds: value });
                  }
                }}
              />
            </Stack>
            <FormControlLabel
              label={'הרצה מדורגת'}
              control={
                <Switch
                  checked={settings.isStaggered}
                  onChange={e => {
                    updateSettings({ ...settings, isStaggered: e.target.checked });
                  }}
                />
              }
            />
            <TimePicker
              label="מחזור מקצי אימון"
              value={
                settings.practiceCycleTimeSeconds
                  ? dayjs().startOf('day').add(settings.practiceCycleTimeSeconds, 'second')
                  : null
              }
              sx={{ width: '75%' }}
              onChange={newTime => {
                if (newTime)
                  updateSettings({
                    ...settings,
                    practiceCycleTimeSeconds: newTime.minute() * 60 + newTime.second()
                  });
              }}
              ampm={false}
              format="mm:ss"
              views={['minutes', 'seconds']}
            />
            <TimePicker
              label="מחזור מקצי דירוג"
              value={
                settings.rankingCycleTimeSeconds
                  ? dayjs().startOf('day').add(settings.rankingCycleTimeSeconds, 'second')
                  : null
              }
              sx={{ width: '75%' }}
              onChange={newTime => {
                if (newTime)
                  updateSettings({
                    ...settings,
                    rankingCycleTimeSeconds: newTime.minute() * 60 + newTime.second()
                  });
              }}
              ampm={false}
              format="mm:ss"
              views={['minutes', 'seconds']}
            />
            <TimePicker
              label="מחזור מפגשי שיפוט"
              value={
                settings.judgingCycleTimeSeconds
                  ? dayjs().startOf('day').add(settings.judgingCycleTimeSeconds, 'second')
                  : null
              }
              sx={{ width: '75%' }}
              onChange={newTime => {
                if (newTime)
                  updateSettings({
                    ...settings,
                    judgingCycleTimeSeconds: newTime.minute() * 60 + newTime.second()
                  });
              }}
              ampm={false}
              format="mm:ss"
              views={['minutes', 'seconds']}
            />
          </Stack>
        </Grid>
        <LocationManager locations={rooms} setLocations={setRooms} title="חדרים" />
        <LocationManager locations={tables} setLocations={setTables} title="שולחנות" />
      </Grid>

      <Stack spacing={2} direction="row" alignItems="center" justifyContent="center" px={2}>
        <Button variant="contained" onClick={goBack}>
          הקודם
        </Button>
        <Button
          variant="contained"
          onClick={async () => {
            await createRooms(rooms);
            await createTables(tables);
            advanceStep();
          }}
          disabled={!canAdvanceStep}
        >
          הבא
        </Button>
      </Stack>
    </LocalizationProvider>
  );
};

export default VenueSetupStep;
