import { useState, useMemo } from 'react';
import { WithId } from 'mongodb';
import {
  Paper,
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
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import dayjs from 'dayjs';
import { Event, EventScheduleEntry, Role, RoleTypes } from '@lems/types';
import { localizedRoles } from '../../localization/roles';
import { apiFetch } from '../../lib/utils/fetch';
import { enqueueSnackbar } from 'notistack';
import { fullMatch } from '@lems/utils/objects';

interface EventScheduleEditorProps extends ButtonProps {
  event: WithId<Event>;
}

const EventScheduleEditor: React.FC<EventScheduleEditorProps> = ({ event, ...props }) => {
  const theme = useTheme();
  const [schedule, setSchedule] = useState<Array<EventScheduleEntry>>(event.schedule || []);

  const sortedSchedule = useMemo(
    () =>
      [...schedule].sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      ),
    [schedule]
  );

  const updateEvent = () => {
    setSchedule(sortedSchedule);
    apiFetch(`/api/admin/events/${event._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schedule: sortedSchedule })
    }).then(res => {
      if (res.ok) {
        enqueueSnackbar('לוח הזמנים של האירוע נשמרה בהצלחה!', { variant: 'success' });
      } else {
        enqueueSnackbar('אופס, שמירת לוח הזמנים של האירוע נכשלה.', { variant: 'error' });
      }
    });
  };

  const getStyles = (name: string, personName: readonly string[], theme: Theme) => {
    return {
      fontWeight:
        personName.indexOf(name) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium
    };
  };

  return (
    <Box
      component="form"
      onSubmit={e => {
        e.preventDefault();
        updateEvent();
      }}
    >
      <Paper sx={{ p: 4 }}>
        <Typography variant="h1" fontSize="1.25rem" fontWeight={600}>
          לוח זמנים כללי לאירוע
        </Typography>
      </Paper>
      <Stack spacing={2} mt={2}>
        {schedule.map((entry, index) => {
          return (
            <Stack component={Paper} spacing={2} sx={{ p: 4 }} key={index}>
              <Stack direction="row" spacing={2} alignItems="center">
                <IconButton
                  onClick={() =>
                    setSchedule(schedule => {
                      const newSchedule = [...schedule];
                      newSchedule.splice(index, 1);
                      return newSchedule;
                    })
                  }
                >
                  <DeleteOutlineIcon />
                </IconButton>
                <TextField
                  label="שם"
                  fullWidth
                  value={entry.name}
                  onChange={e =>
                    setSchedule(schedule => {
                      const newSchedule = [...schedule];
                      newSchedule[index] = {
                        ...entry,
                        name: e.target.value
                      };
                      return newSchedule;
                    })
                  }
                />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <TimePicker
                    label="שעת התחלה"
                    value={dayjs(entry.startTime)}
                    sx={{ minWidth: 150 }}
                    onChange={newTime => {
                      if (newTime) {
                        setSchedule(schedule => {
                          const newSchedule = [...schedule];
                          newSchedule[index] = {
                            ...entry,
                            startTime: newTime.set('seconds', 0).toDate()
                          };
                          return newSchedule;
                        });
                      }
                    }}
                    ampm={false}
                    format="HH:mm"
                    views={['minutes', 'hours']}
                  />
                  <TimePicker
                    label="שעת סיום"
                    value={dayjs(entry.endTime)}
                    sx={{ minWidth: 150 }}
                    onChange={newTime => {
                      if (newTime) {
                        setSchedule(schedule => {
                          const newSchedule = [...schedule];
                          newSchedule[index] = {
                            ...entry,
                            endTime: newTime.set('seconds', 0).toDate()
                          };
                          return newSchedule;
                        });
                      }
                    }}
                    ampm={false}
                    format="HH:mm"
                    views={['minutes', 'hours']}
                  />
                </LocalizationProvider>
              </Stack>
              <FormControl fullWidth>
                <InputLabel id="role-chip-label">תפקידים</InputLabel>
                <Select
                  labelId="role-chip-label"
                  id="role-chip"
                  multiple
                  value={entry.roles}
                  onChange={(e: SelectChangeEvent<Array<Role>>) => {
                    const {
                      target: { value }
                    } = e;
                    setSchedule(schedule => {
                      const newSchedule = [...schedule];
                      newSchedule[index] = {
                        ...entry,
                        roles:
                          typeof value === 'string'
                            ? (value.split(',') as Array<Role>)
                            : (value as Array<Role>)
                      };
                      return newSchedule;
                    });
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

      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <IconButton
          onClick={() =>
            setSchedule(schedule => [
              ...schedule,
              {
                name: `מרכיב לו״ז ${schedule.length + 1}`,
                startTime: dayjs(event.startDate).set('hour', 0).set('minute', 0).toDate(),
                endTime: dayjs(event.startDate).set('hour', 0).set('minute', 0).toDate(),
                roles: []
              }
            ])
          }
        >
          <AddIcon />
        </IconButton>
        <Button type="submit" variant="contained" sx={{ minWidth: 100 }}>
          שמירה
        </Button>

        <Button
          variant="contained"
          sx={{ minWidth: 100 }}
          disabled={fullMatch(schedule, sortedSchedule)}
          onClick={e => setSchedule(sortedSchedule)}
        >
          מיון
        </Button>
      </Stack>
    </Box>
  );
};

export default EventScheduleEditor;
