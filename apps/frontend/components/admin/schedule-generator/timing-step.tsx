import { useState } from 'react';
import { WithId } from 'mongodb';
import dayjs from 'dayjs';
import {
  IconButton,
  Button,
  Stack,
  Typography,
  RadioGroup,
  Radio,
  FormControl,
  FormControlLabel,
  Chip
} from '@mui/material';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { Division, ScheduleBreak, ScheduleGenerationSettings } from '@lems/types';
import CustomNumberInput from '../../field/scoresheet/number-input';

interface BreakEditorProps {
  addBreak: (newBreak: ScheduleBreak) => void;
}

const BreakEditor: React.FC<BreakEditorProps> = ({ addBreak }) => {
  const [newBreak, setNewBreak] = useState<ScheduleBreak>({
    eventType: 'match',
    after: 1,
    durationSeconds: 0
  });

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <FormControl>
        <RadioGroup
          value={newBreak.eventType}
          onChange={e =>
            setNewBreak({ ...newBreak, eventType: e.target.value as 'match' | 'judging' })
          }
        >
          <FormControlLabel value="match" control={<Radio />} label="זירה" />
          <FormControlLabel value="judging" control={<Radio />} label="שיפוט" />
        </RadioGroup>
      </FormControl>
      <Stack direction="column" spacing={1}>
        <Typography variant="caption">מספר סבבי דירוג</Typography>
        <CustomNumberInput
          min={1}
          value={newBreak.after}
          onChange={(e, value) => {
            if (value !== null) {
              e.preventDefault();
              setNewBreak({ ...newBreak, after: value });
            }
          }}
        />
      </Stack>
      <TimePicker
        label="אורך ההפסקה"
        value={dayjs().startOf('day').add(newBreak.durationSeconds, 'second')}
        sx={{ minWidth: 150 }}
        onChange={newTime => {
          if (newTime)
            setNewBreak({
              ...newBreak,
              durationSeconds: newTime.hour() * 60 * 60 + newTime.minute() * 60 + newTime.second()
            });
        }}
        ampm={false}
        format="hh:mm:ss"
        views={['hours', 'minutes', 'seconds']}
      />
      <IconButton
        sx={{ ml: 2 }}
        onClick={() => {
          addBreak(newBreak);
          setNewBreak({ eventType: 'match', after: 1, durationSeconds: 0 });
        }}
      >
        <AddRoundedIcon />
      </IconButton>
    </Stack>
  );
};

interface TimingStepProps {
  division: WithId<Division>;
  settings: ScheduleGenerationSettings;
  updateSettings: (settings: ScheduleGenerationSettings) => void;
  advanceStep: () => void;
  goBack: () => void;
}

const TimingStep: React.FC<TimingStepProps> = ({
  division,
  settings,
  updateSettings,
  advanceStep,
  goBack
}) => {
  const canAdvanceStep =
    settings.matchesStart &&
    settings.judgingStart &&
    settings.practiceCycleTimeSeconds &&
    settings.rankingCycleTimeSeconds &&
    settings.judgingCycleTimeSeconds;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack spacing={2}>
        <Stack spacing={2} direction="row">
          <TimePicker
            label="תחילת מקצים"
            value={settings.matchesStart ? dayjs(settings.matchesStart) : null}
            sx={{ minWidth: 150 }}
            onChange={newTime => {
              if (newTime)
                updateSettings({ ...settings, matchesStart: newTime.set('seconds', 0).toDate() });
            }}
            ampm={false}
            format="HH:mm"
            views={['hours', 'minutes']}
          />
          <TimePicker
            label="תחילת שיפוט"
            value={settings.judgingStart ? dayjs(settings.judgingStart) : null}
            sx={{ minWidth: 150 }}
            onChange={newTime => {
              if (newTime)
                updateSettings({ ...settings, judgingStart: newTime.set('seconds', 0).toDate() });
            }}
            ampm={false}
            format="HH:mm"
            views={['hours', 'minutes']}
          />
        </Stack>
        <Stack spacing={2} direction="row">
          <TimePicker
            label="מחזור מקצי אימונים"
            value={
              settings.practiceCycleTimeSeconds
                ? dayjs().startOf('day').add(settings.practiceCycleTimeSeconds, 'second')
                : null
            }
            sx={{ minWidth: 100 }}
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
            sx={{ minWidth: 100 }}
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
            sx={{ minWidth: 100 }}
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
        <Typography variant="h6">הפסקות</Typography>
        <BreakEditor
          addBreak={newBreak =>
            updateSettings({
              ...settings,
              breaks: [...settings.breaks, newBreak]
            })
          }
        />
        <Stack spacing={2} sx={{ pb: 2 }}>
          {settings.breaks.map(({ eventType, after, durationSeconds }, index) => {
            const localizedEventType = eventType === 'match' ? 'זירה' : 'שיפוט';
            const formattedDuration = dayjs()
              .startOf('day')
              .add(durationSeconds, 'second')
              .format('mm:ss');

            return (
              <Stack direction="row" spacing={2} key={index} alignItems="center">
                <Chip
                  label={`הפסקה ב${localizedEventType} לאחר מקצה ${after} באורך ${formattedDuration} דקות`}
                  onDelete={() => {
                    const updatedBreaks = [...settings.breaks];
                    updatedBreaks.splice(index, 1);
                    updateSettings({
                      ...settings,
                      breaks: updatedBreaks
                    });
                  }}
                />
              </Stack>
            );
          })}
        </Stack>
      </Stack>

      <Stack spacing={2} direction="row" alignItems="center" justifyContent="center" px={2}>
        <Button variant="contained" onClick={goBack}>
          הקודם
        </Button>
        <Button variant="contained" onClick={advanceStep} disabled={!canAdvanceStep}>
          הבא
        </Button>
      </Stack>
    </LocalizationProvider>
  );
};

export default TimingStep;
