import * as React from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import RemoveIcon from '@mui/icons-material/Remove';
import AddRoundedIcon from '@mui/icons-material/Add';

interface CustomNumberInputProps
  extends Omit<TextFieldProps, 'onChange' | 'value' | 'type' | 'disabled'> {
  value: number | null;
  onChange: (event: React.MouseEvent | React.ChangeEvent, value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

const CustomNumberInput = React.forwardRef(function CustomNumberInput(
  props: CustomNumberInputProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const {
    value,
    onChange,
    min = -Infinity,
    max = Infinity,
    step = 1,
    disabled,
    ...otherTextFieldProps
  } = props;

  const handleStep = (event: React.MouseEvent, direction: 'increment' | 'decrement') => {
    const currentValue = value ?? min;
    const newValue = direction === 'increment' ? currentValue + step : currentValue - step;
    onChange(event, Math.max(min, Math.min(max, newValue)));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value === '') {
      onChange(event, null);
    } else {
      const numValue = event.target.valueAsNumber;
      if (!isNaN(numValue)) {
        onChange(event, Math.max(min, Math.min(max, numValue)));
      }
    }
  };

  return (
    <Stack direction="row" spacing={0.5} alignItems="center" ref={ref}>
      <IconButton
        onClick={e => handleStep(e, 'decrement')}
        disabled={disabled || value === null || value <= min}
        size="small"
        sx={{ color: 'primary.main' }}
      >
        <RemoveIcon fontSize="small" />
      </IconButton>

      <TextField
        type="number"
        value={value ?? ''}
        onChange={handleInputChange}
        disabled={disabled}
        slotProps={{
          input: {
            onKeyDown: e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const target = e.target as HTMLInputElement;
                target.blur();
              }
            },
            style: { height: '2.5rem', width: '4rem' }
          }
        }}
        sx={{
          input: {
            textAlign: 'center'
          },
          'input::-webkit-inner-spin-button': {
            display: 'none'
          },
          'input[type=number]': {
            MozAppearance: 'textfield' // Firefox support
          }
        }}
        {...otherTextFieldProps}
        ref={ref}
      />

      <IconButton
        onClick={e => handleStep(e, 'increment')}
        disabled={disabled || value === null || value >= max}
        size="small"
        sx={{ color: 'primary.main' }}
      >
        <AddRoundedIcon fontSize="small" />
      </IconButton>
    </Stack>
  );
});

export default CustomNumberInput;
