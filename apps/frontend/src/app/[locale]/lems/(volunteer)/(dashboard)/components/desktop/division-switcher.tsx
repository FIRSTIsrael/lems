'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Typography, Box, Menu, MenuItem } from '@mui/material';
import { ChevronRight, ChevronLeft } from '@mui/icons-material';
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
  const ChevronIcon = direction === 'ltr' ? ChevronRight : ChevronLeft;

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
          gap: 1,
          px: event.canSwitchDivisions ? 1.5 : 0,
          py: event.canSwitchDivisions ? 1 : 0,
          borderRadius: 1,
          border: event.canSwitchDivisions ? '1px solid rgba(0, 0, 0, 0.12)' : 'none',
          cursor: event.canSwitchDivisions ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
          '&:hover': event.canSwitchDivisions
            ? {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                borderColor: 'rgba(0, 0, 0, 0.2)'
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
            color: 'text.primary',
            fontSize: '0.875rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
          title={event.currentDivision.name}
        >
          {event.currentDivision.name}
        </Typography>
        {event.canSwitchDivisions && (
          <ChevronIcon
            sx={{
              fontSize: '1.25rem',
              marginLeft: 'auto',
              transition: 'transform 0.2s ease',
              transform: anchorEl ? 'rotate(90deg)' : 'rotate(0deg)'
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
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: direction === 'ltr' ? 'left' : 'right'
          }}
          slotProps={{
            paper: {
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.10))',
                borderRadius: 1,
                minWidth: 180,
                py: 0.5,
                marginTop: '8px',
                width: '180px',
                '& .MuiMenuItem-root': {
                  py: 1
                }
              }
            }
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
