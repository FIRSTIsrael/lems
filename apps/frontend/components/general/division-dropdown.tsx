import React, { useState, useRef, CSSProperties, useEffect } from 'react';
import { WithId } from 'mongodb';
import { SelectProvider, useSelect } from '@mui/base';
import { useOption } from '@mui/base';
import { FllEvent, Division } from '@lems/types';
import { Box, IconButton, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/HomeRounded';
import { apiFetch } from '../../lib/utils/fetch';
import { useRouter } from 'next/router';

interface DropdownOptionProps {
  id: string;
  name: string;
  color: CSSProperties['color'];
  disabled: boolean;
}

const DropdownOption: React.FC<DropdownOptionProps> = ({ id, name, color, disabled }) => {
  const { getRootProps, highlighted } = useOption({
    value: id,
    disabled: disabled,
    label: name
  });

  return (
    <Box
      {...getRootProps()}
      bgcolor={highlighted ? '#daecff' : undefined}
      padding={0.5}
      display="flex"
      flexDirection="row"
      gap={1}
      justifyContent="flex-start"
      alignItems="center"
      borderRadius={1}
      paddingX={2}
      minWidth={110}
      sx={disabled ? {} : { cursor: 'pointer', '&:hover': { bgcolor: '#e5eaf2' } }}
    >
      <Box height={10} width={10} borderRadius="50%" bgcolor={disabled ? '#666' : color} />
      <Typography>{name}</Typography>
    </Box>
  );
};

interface DivisionDropdownProps {
  event: WithId<FllEvent>;
  selected: string;
  onSelect?: (divisionId: string) => void;
}

const DivisionDropdown: React.FC<DivisionDropdownProps> = ({ event, selected, onSelect }) => {
  const listboxRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [divisions, setDivisions] = useState<WithId<Division>[]>([]);
  const router = useRouter();

  useEffect(() => {
    apiFetch(`/api/events/${event._id}/divisions`)
      .then(res => res.json())
      .then(data => setDivisions(data));
  }, [event._id]);

  const handleChange =
    onSelect ??
    ((divisionId: string) => {
      router.push({ query: { divisionId } });
    });

  const { getButtonProps, getListboxProps, contextValue } = useSelect<string, false>({
    listboxRef,
    onOpenChange: setOpen,
    open: open,
    value: selected,
    onChange(event, value) {
      value && handleChange(value);
    }
  });

  return (
    <Box position="relative">
      <IconButton {...getButtonProps()} sx={{ position: 'relative' }}>
        <HomeIcon />
      </IconButton>
      <Box
        {...getListboxProps()}
        position="absolute"
        height="auto"
        maxWidth={250}
        zIndex={1}
        bgcolor="white"
        borderRadius={2}
        paddingY={1}
        paddingX={1.5}
        marginTop={2}
        sx={{
          transition: 'opacity 0.1s ease, visibility 0.1s step-end;',
          visibility: open ? 'visible' : 'hidden',
          opacity: open ? 1 : 0
        }}
        display="flex"
        flexDirection="column"
        gap={1}
      >
        <SelectProvider value={contextValue}>
          {divisions.map((division, index) => (
            <DropdownOption
              key={index}
              id={division._id.toString()}
              name={division.name}
              color={division.color}
              disabled={!division.hasState}
            />
          ))}
        </SelectProvider>
      </Box>
    </Box>
  );
};

export default DivisionDropdown;
