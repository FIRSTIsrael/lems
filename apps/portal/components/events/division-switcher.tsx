import { useState } from 'react';
import { PortalDivision, PortalEvent } from '@lems/types';
import { Box, Stack, Typography, Button, Menu, MenuItem } from '@mui/material';
import Link from 'next/link';
import { ArrowDropDown } from '@mui/icons-material';

interface DivisionSwitcherProps {
  event: PortalEvent;
  divisions: PortalDivision[];
}

const DivisionSwitcher: React.FC<DivisionSwitcherProps> = ({ event, divisions }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        variant="text"
        onClick={handleClick}
        aria-controls={open ? 'division-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        sx={{
          p: 1,
          minWidth: 'auto'
        }}
      >
        <Stack direction="row" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <Box bgcolor={event.color} width={18} height={18} borderRadius={1} />
            <Typography variant="body1" color="text.secondary">
              {event.subtitle}
            </Typography>
          </Stack>
          <ArrowDropDown />
        </Stack>
      </Button>
      <Menu
        id="division-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            'aria-labelledby': 'division-button'
          }
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
      >
        {divisions?.map(division => (
          <Link
            key={division.id}
            href={`/events/${division.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <MenuItem onClick={handleClose}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box bgcolor={division.color} width={18} height={18} borderRadius={1} />
                <Typography variant="body1">{division.name}</Typography>
              </Stack>
            </MenuItem>
          </Link>
        ))}
      </Menu>
    </>
  );
};

export default DivisionSwitcher;
