'use client';

import { useTranslations } from 'next-intl';
import { Button, Grid, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useDialog } from '../../dialog-provider';
import { CreateSeasonDialog } from './create-season-dialog';

export const CreateSeasonCard = () => {
  const t = useTranslations('pages.seasons');
  const { showDialog } = useDialog();

  const showCreationDialog = () => {
    showDialog(CreateSeasonDialog);
  };

  return (
    <Grid
      size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
      minHeight={250}
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
        {t('create-new-season')}
      </Typography>
    </Grid>
  );
};
