import { useState } from 'react';
import { WithId } from 'mongodb';
import { Division } from '@lems/types';
import { Chip, IconButton, Stack, TextField } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FormikSwitch from '../../general/forms/formik-switch';
import FormikNumberInput from '../../general/forms/formik-number-input';

interface LocationManagerProps {
  title: string;
  entities: Array<string>;
  addEntity: (entity: string) => void;
  removeEntity: (index: number) => void;
}

const LocationManager: React.FC<LocationManagerProps> = ({
  title,
  entities,
  addEntity,
  removeEntity
}) => {
  const [name, setName] = useState<string>(String(entities.length + 1));

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
            addEntity(name);
            setName(name => String(Number(name) + 1));
          }}
        >
          <AddRoundedIcon />
        </IconButton>
      </Stack>
      <Stack direction="row" spacing={2}>
        {entities.map((entity, index) => (
          <Chip key={index} label={entity} onDelete={removeEntity} />
        ))}
      </Stack>
    </Stack>
  );
};

interface VenueSetupStepProps {
  division: WithId<Division>;
  rooms: Array<string>;
  setRooms: (rooms: Array<string>) => void;
  tables: Array<string>;
  setTables: (tables: Array<string>) => void;
}

const VenueSetupStep: React.FC<VenueSetupStepProps> = ({
  division,
  rooms,
  setRooms,
  tables,
  setTables
}) => {
  const addRoom = (room: string) => {
    setRooms([...rooms, room]);
  };

  const removeRoom = (index: number) => {
    const updatedRooms = [...rooms];
    updatedRooms.splice(index, 1);
    setRooms(updatedRooms);
  };

  const addTable = (table: string) => {
    setTables([...tables, table]);
  };

  const removeTable = (index: number) => {
    const updatedTables = [...tables];
    updatedTables.splice(index, 1);
    setTables(updatedTables);
  };

  return (
    <>
      <Stack spacing={2}>
        <LocationManager
          title="חדרים"
          entities={rooms}
          addEntity={addRoom}
          removeEntity={removeRoom}
        />
        <LocationManager
          title="שולחנות"
          entities={tables}
          addEntity={addTable}
          removeEntity={removeTable}
        />
        <Stack direction="row" spacing={2}>
          <FormikNumberInput name="practiceRounds" label="מספר סבבי אימונים" min={1} max={5} />
          <FormikNumberInput name="rankingRounds" label="מספר סבבי דירוג" min={1} max={5} />
          <FormikSwitch name="isStaggered" label="הרצה מדורגת" />
        </Stack>
      </Stack>
    </>
  );
};

export default VenueSetupStep;
