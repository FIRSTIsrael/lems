'use client';

import { useRef, useState, useEffect } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

export const MIN_SEARCH_LENGTH = 2;

const normalizeSearch = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length >= MIN_SEARCH_LENGTH ? trimmed : '';
};

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
  const lastEmittedRef = useRef(initialValue);

  useEffect(() => () => clearTimeout(debounceTimerRef.current), []);

  useEffect(() => {
    if (initialValue === lastEmittedRef.current) return;
    clearTimeout(debounceTimerRef.current);
    lastEmittedRef.current = initialValue;
    setValue(initialValue);
  }, [initialValue]);

  const handleInput = (newValue: string) => {
    setValue(newValue);
    clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      lastEmittedRef.current = normalizeSearch(newValue);
      onSearchChange(lastEmittedRef.current);
    }, 300);
  };

  const handleClear = () => {
    clearTimeout(debounceTimerRef.current);
    lastEmittedRef.current = '';
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
