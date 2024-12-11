import { useState } from 'react';
import { Paper, Box, Avatar, Typography, Stack, Button } from '@mui/material';
import ManageIcon from '@mui/icons-material/WidgetsRounded';
import SoundTestDialog from './sound-test-dialog';

const JudgeManagementHeader: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <Paper sx={{ borderRadius: 3, mb: 4, boxShadow: 2 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          p: 3,
          pb: 0
        }}
      >
        <Avatar
          sx={{
            bgcolor: '#ccfbf1',
            color: '#2dd4bf',
            width: '2rem',
            height: '2rem',
            mr: 1
          }}
        >
          <ManageIcon sx={{ fontSize: '1rem' }} />
        </Avatar>
        <Typography variant="h2" fontSize="1.25rem">
          ניהול
        </Typography>
      </Box>
      <Stack spacing={2} p={3} direction="row">
        <Button variant="contained" onClick={() => setOpen(true)} sx={{ minWidth: 150 }}>
          בדיקת שמע
        </Button>
        <SoundTestDialog open={open} setOpen={setOpen} />
      </Stack>
    </Paper>
  );
};

export default JudgeManagementHeader;
