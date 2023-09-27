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
import { localizedRoles } from '../../localization/roles';
import { apiFetch } from '../../lib/utils/fetch';
import { enqueueSnackbar } from 'notistack';

interface Props extends ButtonProps {
  event: WithId<Event>;
}

const EventPlanner: React.FC<Props> = ({ event, ...props }) => {
  const theme = useTheme();
  const [plan, setPlan] = useState<Array<EventPlanEntry>>(event.plan || []);

  const updateEvent = () => {
    apiFetch(`/api/admin/events/${event._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan })
    }).then(res => {
      if (res.ok) {
        enqueueSnackbar('תוכנית האירוע נשמרה בהצלחה!', { variant: 'success' });
      } else {
        enqueueSnackbar('אופס, שמירת תוכנית האירוע נכשלה.', { variant: 'error' });
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
      <Typography variant="h2" fontSize="1.25rem" fontWeight={600} gutterBottom>
        תכנית האירוע
      </Typography>
      <Stack spacing={2} mt={2}>
        {plan.map((entry, index) => {
          return (
            <Stack direction="row" spacing={2} key={index} alignItems="flex-start">
              <TextField
                label="שם"
                size="small"
                fullWidth
                value={entry.name}
                onChange={e =>
                  setPlan(plan => {
                    const newPlan = [...plan];
                    newPlan[index] = {
                      ...entry,
                      name: e.target.value
                    };
                    return newPlan;
                  })
                }
              />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  label="שעת התחלה"
                  value={dayjs(entry.startTime)}
                  sx={{ minWidth: 110 }}
                  onChange={newTime => {
                    if (newTime) {
                      setPlan(plan => {
                        const newPlan = [...plan];
                        newPlan[index] = {
                          ...entry,
                          startTime: newTime.toDate()
                        };
                        return newPlan.sort(
                          (a, b) =>
                            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
                        );
                      });
                    }
                  }}
                  ampm={false}
                  format="HH:mm"
                  slots={{
                    textField: params => <TextField {...params} />
                  }}
                  slotProps={{ textField: { size: 'small' } }}
                />
                <TimePicker
                  label="שעת סיום"
                  value={dayjs(entry.endTime)}
                  sx={{ minWidth: 110 }}
                  onChange={newTime => {
                    if (newTime) {
                      setPlan(plan => {
                        const newPlan = [...plan];
                        newPlan[index] = {
                          ...entry,
                          endTime: newTime.toDate()
                        };
                        return newPlan;
                      });
                    }
                  }}
                  ampm={false}
                  format="HH:mm"
                  slots={{
                    textField: params => <TextField {...params} />
                  }}
                  slotProps={{ textField: { size: 'small' } }}
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
                    setPlan(plan => {
                      const newPlan = [...plan];
                      newPlan[index] = {
                        ...entry,
                        roles:
                          typeof value === 'string'
                            ? (value.split(',') as Array<Role>)
                            : (value as Array<Role>)
                      };
                      return newPlan;
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

      <IconButton
        sx={{ mt: 2 }}
        onClick={() =>
          setPlan(plan =>
            [
              ...plan,
              {
                name: `מרכיב תכנית ${plan.length + 1}`,
                startTime: dayjs(event.startDate).set('hour', 0).set('minute', 0).toDate(),
                endTime: dayjs(event.startDate).set('hour', 0).set('minute', 0).toDate(),
                roles: []
              }
            ].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
          )
        }
      >
        <AddIcon />
      </IconButton>

      <Box justifyContent="center" display="flex">
        <Button type="submit" variant="contained" sx={{ minWidth: 100 }}>
          שמירה
        </Button>
      </Box>
    </Box>
  );
};

export default EventPlanner;
