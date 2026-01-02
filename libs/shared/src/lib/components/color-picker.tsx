'use client';

import React, { useState, useEffect, CSSProperties } from 'react';
import { motion } from 'motion/react';
import {
  Paper,
  Popper,
  ClickAwayListener,
  Stack,
  Box,
  useTheme,
  alpha,
  TextField,
  IconButton
} from '@mui/material';
import { Saturation, Hue, hsvaToHex, hexToHsva, HsvaColor } from '@uiw/react-color';

interface ColorPickerProps {
  value: HsvaColor;
  onChange: (color: HsvaColor) => void;
  children: React.ReactElement;
  defaultOpen?: boolean;
  sx?: CSSProperties;
}

const PRESET_COLORS = [
  '#DF1125',
  '#FC4E12',
  '#F12E6D',
  '#E8C511',
  '#80E220',
  '#1EA5FC',
  '#1E538F',
  '#5F41B2'
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  children,
  defaultOpen = false,
  sx = {}
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [hexInput, setHexInput] = useState(hsvaToHex(value));
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    setHexInput(hsvaToHex(value));
  }, [value]);

  useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);

  const handleSaturationChange = (newHsva: HsvaColor) => {
    onChange(newHsva);
  };

  const handleHueChange = (newHue: { h: number }) => {
    onChange({ ...value, h: newHue.h });
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setHexInput(inputValue);

    const hexPattern = /^#?[0-9A-Fa-f]{6}$/;
    if (hexPattern.test(inputValue)) {
      const normalized = inputValue.startsWith('#') ? inputValue : `#${inputValue}`;
      try {
        const newHsva = hexToHsva(normalized);
        onChange(newHsva);
      } catch {
        // ignore invalid hex conversion
      }
    }
  };

  const handleTriggerClick = (event: React.MouseEvent) => {
    setOpen(!open);
    event.stopPropagation();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen(!open);
    }
  };

  const handleClickAway = () => {
    setOpen(false);
  };

  const handlePresetClick = (hex: string) => {
    const hsva = hexToHsva(hex);
    onChange(hsva);
  };

  return (
    <Box ref={setAnchorEl} display="inline-block">
      <Box
        onClick={handleTriggerClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        sx={{ cursor: 'pointer' }}
        aria-label="Open color picker"
      >
        {children}
      </Box>

      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="bottom-start"
        modifiers={[
          { name: 'offset', options: { offset: [0, 8] } },
          {
            name: 'preventOverflow',
            options: { boundary: 'viewport', padding: 16 }
          }
        ]}
        style={{ zIndex: theme.zIndex.modal }}
      >
        <ClickAwayListener onClickAway={handleClickAway}>
          <Paper
            component={motion.div}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{
              duration: 0.12,
              ease: [0.4, 0.0, 0.2, 1]
            }}
            elevation={8}
            sx={{
              p: 2,
              borderRadius: (theme.shape.borderRadius as number) / 4,
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              minWidth: 280,
              transformOrigin: 'top left',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -6,
                left: 12,
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderBottom: `6px solid ${theme.palette.background.paper}`,
                zIndex: 2
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: -7,
                left: 12,
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderBottom: `6px solid ${alpha(theme.palette.divider, 0.12)}`,
                zIndex: 1
              },
              ...sx
            }}
          >
            <Stack spacing={2}>
              <Box width="100%" height={160} overflow="hidden">
                <Saturation
                  hsva={value}
                  onChange={handleSaturationChange}
                  radius={16}
                  style={{ width: '100%', height: '100%' }}
                />
              </Box>

              <Box width="100%" height={16}>
                <Hue
                  hue={value.h}
                  onChange={handleHueChange}
                  style={{ width: '100%', height: '100%' }}
                  radius={16}
                />
              </Box>

              <TextField
                label="Hex"
                size="small"
                value={hexInput.replace(/^#/, '')}
                onChange={handleHexChange}
                slotProps={{
                  input: {
                    startAdornment: <span style={{ color: '#888', marginRight: 4 }}>#</span>
                  }
                }}
              />

              {/* Preset color swatches */}
              <Box display="flex" flexWrap="wrap" gap={1}>
                {PRESET_COLORS.map(hex => (
                  <IconButton
                    disableRipple
                    key={hex}
                    size="small"
                    onClick={() => handlePresetClick(hex)}
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: hex,
                      transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'scale(1.15)',
                        boxShadow: `0 4px 12px ${alpha(hex, 0.4)}}`
                      }
                    }}
                  />
                ))}
              </Box>

              <Box
                width="100%"
                height={32}
                borderRadius={theme.shape.borderRadius}
                sx={{ backgroundColor: hsvaToHex(value) }}
              />
            </Stack>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Box>
  );
};
