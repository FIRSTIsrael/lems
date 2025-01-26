import { useState, useEffect, useMemo } from 'react';
import { WithId, ObjectId } from 'mongodb';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { enqueueSnackbar } from 'notistack';
import {
  Paper,
  Button,
  Stack,
  Typography,
  IconButton,
  Checkbox,
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
  SelectChangeEvent,
  FormControlLabel
} from '@mui/material';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { FllEvent, Division, DivisionScheduleEntry, Role, RoleTypes } from '@lems/types';
import { fullMatch } from '@lems/utils/objects';
import { localizedRoles } from '../../localization/roles';
import { apiFetch } from '../../lib/utils/fetch';
import EventSelectorModal from '../general/event-selector-modal';

interface DivisionOutlineEditorProps {
  event: WithId<FllEvent>;
  division: WithId<Division>;
}

const DivisionOutlineEditor: React.FC<DivisionOutlineEditorProps> = ({ event, division }) => {
  const theme = useTheme();
  const router = useRouter();
  const [schedule, setSchedule] = useState<Array<DivisionScheduleEntry>>(division.schedule || []);
  const [copyModal, setCopyModal] = useState(false);
  const [events, setEvents] = useState<Array<WithId<FllEvent>>>([]);

  useEffect(() => {
    apiFetch(`/public/events`).then(res => {
      res.json().then(data => setEvents(data));
    });
  }, []);

  const sortedSchedule = useMemo(
    () =>
      [...schedule].sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      ),
    [schedule]
  );

  const copyScheduleFrom = (eventId: string | ObjectId, divisionId?: string | ObjectId) => {
    if (divisionId && String(divisionId) === String(division._id)) return;
    const _event = events.find(e => String(e._id) === String(eventId));
    if (!_event) return;
    if (!divisionId && _event?.enableDivisions) return;
    let copyFromDivision;
    if (divisionId) {
      copyFromDivision = _event?.divisions?.find(d => String(d._id) === String(divisionId));
    } else {
      copyFromDivision = _event?.divisions?.[0];
    }
    if (!copyFromDivision) return;

    apiFetch(`/api/events/${eventId}/divisions?withSchedule=true`)
      .then(res => res.json())
      .then(data => {
        if (data[0]?.schedule?.length > 0) {
          const getNewDate = (date: Date): Date => {
            const hour = dayjs(date).get('hours');
            const minute = dayjs(date).get('minutes');
            return dayjs(event.startDate).set('hours', hour).set('minutes', minute).toDate();
          };

          const newSchedule = data[0]?.schedule.map((entry: DivisionScheduleEntry) => {
            return {
              ...entry,
              startTime: getNewDate(entry.startTime),
              endTime: getNewDate(entry.endTime)
            };
          });

          setSchedule(newSchedule);
          enqueueSnackbar('הלו"ז הכללי הועתק בהצלחה!', { variant: 'success' });
          setCopyModal(false);
        } else {
          enqueueSnackbar('לאירוע שבחרתם אין לו"ז כללי', { variant: 'warning' });
        }
      });
  };

  const updateDivision = () => {
    setSchedule(sortedSchedule);
    apiFetch(`/api/admin/divisions/${division._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schedule: sortedSchedule })
    }).then(res => {
      if (res.ok) {
        enqueueSnackbar('לוח הזמנים נשמר בהצלחה!', { variant: 'success' });
      } else {
        enqueueSnackbar('אופס, שמירת לוח הזמנים נכשלה.', { variant: 'error' });
      }
    });
  };

  const getStyles = (name: string, roleList: readonly string[], theme: Theme) => {
    return {
      fontWeight:
        roleList.indexOf(name) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium
    };
  };

  return (
    <Box
      component="form"
      onSubmit={e => {
        e.preventDefault();
        updateDivision();
        router.reload();
      }}
    >
      <Stack spacing={2}>
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
                    views={['hours', 'minutes']}
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
                    views={['hours', 'minutes']}
                  />
                </LocalizationProvider>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={schedule[index].showOnDashboard}
                      onChange={e =>
                        setSchedule(schedule => {
                          const newSchedule = [...schedule];
                          newSchedule[index] = {
                            ...entry,
                            showOnDashboard: e.target.checked
                          };
                          return newSchedule;
                        })
                      }
                    />
                  }
                  label={<Typography fontSize="0.85rem">הצגה ב-Dashboard</Typography>}
                />
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
          <AddRoundedIcon />
        </IconButton>
        <Button
          variant="contained"
          sx={{ minWidth: 100 }}
          disabled={fullMatch(schedule, sortedSchedule)}
          onClick={() => setSchedule(sortedSchedule)}
        >
          מיון
        </Button>
        <Button type="submit" variant="contained" sx={{ minWidth: 100 }}>
          שמירה
        </Button>
        <Button
          variant="contained"
          sx={{ minWidth: 100 }}
          onClick={() => setCopyModal(true)}
          disabled={schedule.length > 0}
        >
          העתקה מאירוע אחר
        </Button>
        <EventSelectorModal
          title="העתקת לו״ז כללי"
          open={copyModal}
          setOpen={setCopyModal}
          events={events}
          onSelect={copyScheduleFrom}
        />
      </Stack>
    </Box>
  );
};

export default DivisionOutlineEditor;
