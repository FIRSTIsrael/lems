import dayjs from 'dayjs';
import { Card, CardContent, CardMedia, Grid, Typography } from '@mui/material';
import { AdminSeasonResponse } from '@lems/backend/schemas';

interface SeasonCardProps {
  season: AdminSeasonResponse;
}

export const SeasonCard: React.FC<SeasonCardProps> = ({ season }) => {
  return (
    <Grid
      size={2}
      component={Card}
      pt={3}
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      variant="outlined"
    >
      <CardMedia
        sx={{ height: 140, objectFit: 'contain' }}
        src={season.logoUrl || '/images/default-season-logo.svg'}
        component="img"
        title={season.name}
      />
      <CardContent sx={{ textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          {season.name}
        </Typography>
        <Typography variant="body1">
          {dayjs(season.startDate).format('DD/MM/YYYY')} -{' '}
          {dayjs(season.endDate).format('DD/MM/YYYY')}
        </Typography>
      </CardContent>
    </Grid>
  );
};
