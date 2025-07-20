'use client';

import { Button, Grid, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useDialog } from '../../dialog-provider';
import { CreateSeasonDialog } from './create-season-dialog';

export const CreateSeasonCard = () => {
  const { showDialog, setDialogComponent } = useDialog();

  const showCreationDialog = () => {
    setDialogComponent(<CreateSeasonDialog />);
    showDialog();
  };

  return (
    <Grid
      size={2}
      component={Button}
      p={2}
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      variant="text"
      color="text.primary"
      onClick={showCreationDialog}
    >
      <AddRoundedIcon fontSize="large" />
      <Typography variant="h4" align="center" gutterBottom>
        Create New Season
      </Typography>
    </Grid>
  );
};
