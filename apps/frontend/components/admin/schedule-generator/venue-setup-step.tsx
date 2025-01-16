import { useState, useEffect } from 'react';
import { WithId } from 'mongodb';
import { Division, JudgingRoom, RobotGameTable, ScheduleGenerationSettings } from '@lems/types';
import {
  Button,
  Chip,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { apiFetch } from '../../../lib/utils/fetch';
import CustomNumberInput from '../../field/scoresheet/number-input';

interface LocationManagerProps {
  title: string;
  locations: Array<string>;
  setLocations(newLocations: Array<string>): void;
}

const LocationManager: React.FC<LocationManagerProps> = ({ title, locations, setLocations }) => {
  const [name, setName] = useState<string>('1');

  const add = (location: string) => {
    setLocations([...locations, location]);
  };

  const remove = (index: number) => {
    const updatedLocations = [...locations];
    updatedLocations.splice(index, 1);
    setLocations(updatedLocations);
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2}>
        <TextField
          label={`הוסף ${title}`}
          value={name}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setName(event.target.value);
          }}
        />
        <IconButton
          sx={{ ml: 2 }}
          onClick={() => {
            add(name);
            if (!isNaN(Number(name))) setName(String(Number(name) + 1));
            else setName('');
          }}
        >
          <AddRoundedIcon />
        </IconButton>
      </Stack>
      <Stack direction="row" spacing={2}>
        {locations.map((location, index) => (
          <Chip key={index} label={location} onDelete={remove} />
        ))}
      </Stack>
    </Stack>
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
  const canAdvanceStep = rooms.length > 0 && tables.length > 0;

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
    <>
      <Stack spacing={2}>
        <LocationManager title="חדרים" locations={rooms} setLocations={setRooms} />
        <LocationManager title="שולחנות" locations={tables} setLocations={setTables} />

        <Stack direction="row" spacing={2}>
          <Stack direction="column" spacing={1}>
            <Typography variant="caption">מספר סבבי אימונים</Typography>
            <CustomNumberInput
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
          <Stack direction="column" spacing={1}>
            <Typography variant="caption">מספר סבבי דירוג</Typography>
            <CustomNumberInput
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
      </Stack>

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
    </>
  );
};

export default VenueSetupStep;
