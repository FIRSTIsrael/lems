import React from 'react';
import { Autocomplete, TextField, AutocompleteProps } from '@mui/material';
import { Public } from '@mui/icons-material';
import { ALL_TIMEZONES } from '../utils/timezones';

interface TimeZonePickerProps<disableClearable extends boolean> extends Omit<
  AutocompleteProps<string, false, disableClearable, false>,
  'onChange' | 'value' | 'options' | 'renderInput'
> {
  value: string;
  onChange: (timezone: string) => void;
  label?: string;
  size?: 'small' | 'medium';
}

export const TimeZonePicker: React.FC<TimeZonePickerProps<boolean>> = ({
  value,
  onChange,
  label = 'Timezone',
  size = 'medium',
  fullWidth = true,
  disabled = false,
  disableClearable,
  ...autoCompleteProps
}) => {
  return (
    <Autocomplete
      {...autoCompleteProps}
      value={value}
      onChange={(_event, newValue) => {
        if (newValue) {
          onChange(newValue);
        }
      }}
      options={ALL_TIMEZONES}
      disableClearable={disableClearable}
      renderInput={params => (
        <TextField
          {...params}
          fullWidth
          label={label}
          size={size}
          slotProps={{
            ...params.slotProps,

            input: {
              ...params.slotProps.input,
              startAdornment: (
                <>
                  <Public sx={{ mr: 1, color: 'action.active' }} />
                  {params.slotProps.input.startAdornment}
                </>
              )
            }
          }}
        />
      )}
      fullWidth={fullWidth}
      disabled={disabled}
    />
  );
};
