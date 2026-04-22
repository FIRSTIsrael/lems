'use client';

import { useRef, useEffect } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

interface TeamSearchInputProps {
  initialValue: string;
  placeholder: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
  showClearButton: boolean;
}

export const TeamSearchInput: React.FC<TeamSearchInputProps> = ({
  initialValue,
  placeholder,
  onSearchChange,
  onClear,
  showClearButton
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== initialValue) {
      inputRef.current.value = initialValue;
    }
  }, [initialValue]);

  const handleInput = (value: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      onSearchChange(value);
    }, 300);
  };

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onClear();
  };

  return (
    <TextField
      fullWidth
      size="small"
      placeholder={placeholder}
      defaultValue={initialValue}
      onChange={e => handleInput(e.target.value)}
      inputRef={inputRef}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: showClearButton && (
          <InputAdornment position="end">
            <IconButton size="small" onClick={handleClear} edge="end">
              <ClearIcon />
            </IconButton>
          </InputAdornment>
        )
      }}
    />
  );
};
