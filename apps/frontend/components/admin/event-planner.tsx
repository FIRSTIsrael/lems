import { useState } from 'react';
import { WithId } from 'mongodb';
import {
  ButtonProps,
  Stack,
  Typography,
  Button,
  IconButton,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Chip,
  MenuItem,
  OutlinedInput,
  Select,
  Theme,
  useTheme,
  SelectChangeEvent
} from '@mui/material';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AddIcon from '@mui/icons-material/Add';
import dayjs from 'dayjs';
import { Event, EventPlanEntry, Role, RoleTypes } from '@lems/types';
import { replaceArrayElement } from '@lems/utils';
import { localizedRoles } from '../../localization/roles';

// TODO: תפקידים label is too low when its empty
// TODO: Time picker gui (click on the clocks) is wonk af
// TODO: Roles field grows but the other stay small
// TODO: save button saves in db
// TODO: This entire code needs cleaning because its not DRY at all and its very dumb

interface Props extends ButtonProps {
  event: WithId<Event>;
}

const EventPlanner: React.FC<Props> = ({ event, ...props }) => {
  const theme = useTheme();
  const [plan, setPlan] = useState<Array<EventPlanEntry>>(event.plan || []);

  const getStyles = (name: string, personName: readonly string[], theme: Theme) => {
    return {
      fontWeight:
        personName.indexOf(name) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium
    };
  };

  return (
    <>
      <Typography variant="h2" fontSize="1.25rem" fontWeight={600} gutterBottom>
        תכנית האירוע
      </Typography>
      <Stack spacing={2} mt={2}>
        {plan.map((entry, index) => {
          return (
            <Stack direction="row" spacing={2} key={index} alignItems="flex-start">
              <TextField
                label="שם"
                fullWidth
                value={entry.name}
                onChange={e =>
                  setPlan(plan =>
                    replaceArrayElement(
                      plan,
                      (element: EventPlanEntry) => element.name === entry.name,
                      {
                        ...entry,
                        name: e.target.value
                      }
                    )
                  )
                }
              />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  label="שעת התחלה"
                  value={dayjs(entry.startTime)}
                  sx={{ minWidth: 110 }}
                  onChange={newTime => {
                    if (newTime) {
                      setPlan(plan =>
                        replaceArrayElement(
                          plan,
                          (element: EventPlanEntry) => element.name === entry.name,
                          {
                            ...entry,
                            startTime: newTime.toDate()
                          }
                        )
                      );
                    }
                  }}
                  format="HH:mm"
                  slots={{
                    textField: params => <TextField {...params} />
                  }}
                />
                <TimePicker
                  label="שעת סיום"
                  value={dayjs(entry.endTime)}
                  sx={{ minWidth: 110 }}
                  onChange={newTime => {
                    if (newTime) {
                      setPlan(plan =>
                        replaceArrayElement(
                          plan,
                          (element: EventPlanEntry) => element.name === entry.name,
                          {
                            ...entry,
                            endTime: newTime.toDate()
                          }
                        )
                      );
                    }
                  }}
                  format="HH:mm"
                  slots={{
                    textField: params => <TextField {...params} />
                  }}
                />
              </LocalizationProvider>
              <FormControl fullWidth>
                <InputLabel id="role-chip-label">תפקידים</InputLabel>
                <Select
                  labelId="role-chip-label"
                  size="small"
                  id="role-chip"
                  multiple
                  value={entry.roles}
                  onChange={(e: SelectChangeEvent<Array<Role>>) => {
                    const {
                      target: { value }
                    } = e;
                    setPlan(plan =>
                      replaceArrayElement(
                        plan,
                        (element: EventPlanEntry) => element.name === entry.name,
                        {
                          ...entry,
                          // On autofill we get a stringified value.
                          roles:
                            typeof value === 'string'
                              ? (value.split(',') as Array<Role>)
                              : (value as Array<Role>)
                        }
                      )
                    );
                  }}
                  input={<OutlinedInput id="select-multiple-chip" label="תפקידים" />}
                  renderValue={selected => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map(value => (
                        <Chip key={value} label={localizedRoles[value].name} />
                      ))}
                    </Box>
                  )}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 48 * 4.5 + 8,
                        width: 250
                      }
                    }
                  }}
                >
                  {RoleTypes.map(role => (
                    <MenuItem key={role} value={role} style={getStyles(role, entry.roles, theme)}>
                      {localizedRoles[role].name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          );
        })}
      </Stack>

      <IconButton
        sx={{ mt: 2 }}
        onClick={() =>
          setPlan(plan => [
            ...plan,
            { name: 'test', startTime: new Date(), endTime: new Date(), roles: [] }
          ])
        }
      >
        <AddIcon />
      </IconButton>

      <Box justifyContent="center" display="flex">
        <Button type="submit" variant="contained" sx={{ minWidth: 100 }}>
          שמירה
        </Button>
      </Box>
    </>
  );
};

export default EventPlanner;
