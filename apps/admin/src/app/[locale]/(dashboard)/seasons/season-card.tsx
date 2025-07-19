import Image from 'next/image';
import { Card, CardContent, CardMedia, Grid, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { AdminSeasonResponse } from '@lems/backend/schemas';

interface SeasonCardProps {
  season: AdminSeasonResponse;
}

export const SeasonCard: React.FC<SeasonCardProps> = ({ season }) => {
  return (
    <Grid
      size={3}
      component={Card}
      p={2}
      display="flex"
      justifyContent="center"
      alignItems="center"
      variant="outlined"
    >
      <CardMedia
        sx={{ height: 140 }}
        src={season.logoUrl || '/default-logo.svg'}
        title={season.name}
      />
      <CardContent>
        <Typography variant="h4">
          {dayjs(season.startDate).format('DD/MM/YYYY')} -{' '}
          {dayjs(season.endDate).format('DD/MM/YYYY')}
        </Typography>
      </CardContent>
    </Grid>
  );
};
