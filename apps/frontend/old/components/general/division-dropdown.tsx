import React, { useState, useRef, CSSProperties, useEffect } from 'react';
import { WithId } from 'mongodb';
import { FllEvent, Division } from '@lems/types';
import { Box, IconButton, Typography, Menu, MenuItem } from '@mui/material';
import HomeIcon from '@mui/icons-material/HomeRounded';
import { useRouter } from 'next/router';
import { apiFetch } from '../../lib/utils/fetch';

interface DropdownOptionProps {
  id: string;
  name: string;
  color: CSSProperties['color'];
  disabled: boolean;
  onClick?: () => void;
  selected?: boolean;
}

const DropdownOption: React.FC<DropdownOptionProps> = ({
  name,
  color,
  disabled,
  onClick,
  selected
}) => {
  return (
    <MenuItem
      onClick={onClick}
      disabled={disabled}
      selected={selected}
      sx={
        disabled
          ? { minWidth: 110 }
          : { cursor: 'pointer', '&:hover': { bgcolor: '#e5eaf2' }, minWidth: 110 }
      }
    >
      <Box display="flex" flexDirection="row" gap={1} alignItems="center" width="100%">
        <Box height={10} width={10} borderRadius="100%" bgcolor={disabled ? '#666' : color} />
        <Typography>{name}</Typography>
      </Box>
    </MenuItem>
  );
};

interface DivisionDropdownProps {
  event: WithId<FllEvent>;
  selected: string;
}

const DivisionDropdown: React.FC<DivisionDropdownProps> = ({ event, selected }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [divisions, setDivisions] = useState<WithId<Division>[]>([]);
  const router = useRouter();
  const open = Boolean(anchorEl);

  useEffect(() => {
    apiFetch(`/api/events/${event._id}/divisions`)
      .then(res => res.json())
      .then(data => setDivisions(data));
  }, [event._id]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (divisionId: string) => {
    router.push({ query: { divisionId } });
  };

  return (
    <Box position="relative">
      <IconButton onClick={handleClick}>
        <HomeIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
      >
        {divisions.map(division => (
          <DropdownOption
            key={division._id.toString()}
            id={division._id.toString()}
            name={division.name}
            color={division.color}
            disabled={!division.hasState}
            onClick={() => handleChange(division._id.toString())}
            selected={selected === division._id.toString()}
          />
        ))}
      </Menu>
    </Box>
  );
};

export default DivisionDropdown;
