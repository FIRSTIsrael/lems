'use client';

import { Paper, Typography, useTheme, Box, Button } from '@mui/material';
import { useState } from 'react';
import SoundTestDialog from './sound-test-dialog';

interface PageHeaderProps {
  title: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 3 },
        borderBottom: `2px solid ${theme.palette.divider}`,
        boxShadow: 'none',
        backgroundColor: theme.palette.background.paper
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' }
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
          }}
        >
          {title}
        </Typography>
        <Box>
          <Button variant="contained" onClick={() => setOpen(true)}>
            בדיקת שמע
          </Button>
          <SoundTestDialog open={open} setOpen={setOpen} />
        </Box>
      </Box>
    </Paper>
  );
};
