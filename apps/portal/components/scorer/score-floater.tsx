import { useContext } from 'react';
import { Typography, Stack, Paper, IconButton } from '@mui/material';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import { MissionContext } from './mission-context';

const ScoreFloater = () => {
  const { points, resetScore } = useContext(MissionContext);

  if (!points) return null;

  return (
    <Stack
      component={Paper}
      direction="row"
      alignItems="center"
      justifyContent="center"
      spacing={3}
      sx={{
        p: 4,
        position: 'fixed',
        bottom: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        width: { xs: '95%', md: '400px' },
        zIndex: 1,
        bgcolor: 'primary.main',
        borderRadius: 4,
        height: 50
      }}
    >
      <Typography sx={{ color: '#FFF' }} fontWeight={500} fontSize="1.25rem">
        {points} נק&apos;
      </Typography>
      <IconButton sx={{ color: '#FFF' }} onClick={resetScore}>
        <RestartAltRoundedIcon />
      </IconButton>
    </Stack>
  );
};

export default ScoreFloater;
