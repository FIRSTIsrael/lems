'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Typography, Box, Menu, MenuItem } from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import { Locale, Locales } from '@lems/localization';
import { useEvent } from '../../../components/event-context';

export const DivisionSwitcher = () => {
  const event = useEvent();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLocale = useLocale() as Locale;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const displayDivision = !!event.currentDivision.name.trim();
  const direction = Locales[currentLocale].direction;

  if (!displayDivision) {
    return null;
  }

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (event.canSwitchDivisions) {
      setAnchorEl(e.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDivisionSelect = (divisionId: string) => {
    handleClose();
    const params = new URLSearchParams(searchParams);
    params.set('division', divisionId);
    router.push(`?${params.toString()}`);
  };

  return (
    <>
      <Box
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          paddingX: 1,
          paddingY: 0.5,
          borderRadius: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.1) inset',
          cursor: event.canSwitchDivisions ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
          '&:hover': event.canSwitchDivisions
            ? {
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }
            : {}
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: event.currentDivision.color,
            flexShrink: 0
          }}
        />
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            fontSize: '0.7rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
          title={event.currentDivision.name}
        >
          {event.currentDivision.name}
        </Typography>
        {event.canSwitchDivisions && (
          <KeyboardArrowDown
            sx={{
              fontSize: '0.85rem',
              marginLeft: 'auto',
              transition: 'transform 0.2s ease',
              transform: anchorEl ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
          />
        )}
      </Box>

      {event.canSwitchDivisions && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          disableScrollLock
          transformOrigin={{
            vertical: -6,
            horizontal: direction === 'ltr' ? 'left' : 'right'
          }}
          slotProps={{
            paper: { sx: { width: '150px' } }
          }}
        >
          {event.availableDivisions.map(division => (
            <MenuItem
              key={division.id}
              onClick={() => handleDivisionSelect(division.id)}
              selected={division.id === event.currentDivision.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: division.color,
                  flexShrink: 0
                }}
              />
              <Typography variant="body2" textOverflow="ellipsis" noWrap>
                {division.name}
              </Typography>
            </MenuItem>
          ))}
        </Menu>
      )}
    </>
  );
};
