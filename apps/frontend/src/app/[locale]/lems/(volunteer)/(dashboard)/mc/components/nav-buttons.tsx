'use client';

import { Stack, IconButton, Typography, Box, useMediaQuery, useTheme } from '@mui/material';
import { NavigateBefore, NavigateNext } from '@mui/icons-material';

interface NavButtonsProps {
  current: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const NavButtons: React.FC<NavButtonsProps> = ({ current, total, onPrevious, onNext }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      justifyContent="center"
      sx={{
        pt: 2,
        pb: 1
      }}
    >
      <IconButton
        onClick={onPrevious}
        disabled={current === 0}
        sx={{
          width: isMobile ? 40 : 44,
          height: isMobile ? 40 : 44,
          backgroundColor: 'action.hover',
          '&:hover': {
            backgroundColor: 'action.selected'
          }
        }}
      >
        <NavigateBefore />
      </IconButton>

      <Box sx={{ minWidth: isMobile ? 60 : 80, textAlign: 'center' }}>
        <Typography variant={isMobile ? 'body2' : 'body1'} sx={{ fontWeight: 600 }}>
          {current + 1}/{total}
        </Typography>
      </Box>

      <IconButton
        onClick={onNext}
        disabled={current === total - 1}
        sx={{
          width: isMobile ? 40 : 44,
          height: isMobile ? 40 : 44,
          backgroundColor: 'action.hover',
          '&:hover': {
            backgroundColor: 'action.selected'
          }
        }}
      >
        <NavigateNext />
      </IconButton>
    </Stack>
  );
};
