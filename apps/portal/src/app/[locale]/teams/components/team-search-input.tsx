'use client';

import { useRef, useState, useEffect } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

interface TeamSearchInputProps {
  initialValue: string;
  placeholder: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
}

export const TeamSearchInput: React.FC<TeamSearchInputProps> = ({
  initialValue,
  placeholder,
  onSearchChange,
  onClear
}) => {
  const [value, setValue] = useState(initialValue);
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => () => clearTimeout(debounceTimerRef.current), []);

  const handleInput = (newValue: string) => {
    setValue(newValue);
    clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      onSearchChange(newValue);
    }, 300);
  };

  const handleClear = () => {
    clearTimeout(debounceTimerRef.current);
    setValue('');
    onClear();
  };

  return (
    <TextField
      fullWidth
      size="small"
      placeholder={placeholder}
      value={value}
      onChange={e => handleInput(e.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: value && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClear} edge="end">
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          )
        }
      }}
    />
  );
};
