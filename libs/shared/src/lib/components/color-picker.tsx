import React, { useState, useRef, CSSProperties } from 'react';
import { motion } from 'motion/react';
import { Paper, Popper, ClickAwayListener, Stack, Box, useTheme, alpha } from '@mui/material';
import { Saturation, Hue, hsvaToHex, HsvaColor } from '@uiw/react-color';

interface ColorPickerProps {
  value: HsvaColor;
  onChange: (color: HsvaColor) => void;
  children: React.ReactElement;
  defaultOpen?: boolean;
  sx?: CSSProperties;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  children,
  defaultOpen = false,
  sx = {}
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(defaultOpen);
  const anchorRef = useRef<HTMLDivElement>(null);

  const handleSaturationChange = (newHsva: { h: number; s: number; v: number; a: number }) => {
    onChange(newHsva);
  };

  const handleHueChange = (newHue: { h: number }) => {
    const newHsva = { ...value, h: newHue.h };
    onChange(newHsva);
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

  return (
    <Box ref={anchorRef} display="inline-block">
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
        anchorEl={anchorRef.current}
        placement="bottom-start"
        modifiers={[
          { name: 'offset', options: { offset: [0, 8] } },
          {
            name: 'preventOverflow',
            options: {
              boundary: 'viewport',
              padding: 16
            }
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
              ease: [0.4, 0.0, 0.2, 1] // Material Design easing
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
