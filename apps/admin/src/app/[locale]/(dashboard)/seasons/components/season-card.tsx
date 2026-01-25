import dayjs from 'dayjs';
import { Card, CardContent, CardMedia, Grid, Typography } from '@mui/material';
import { Season } from '@lems/types/api/admin';
import { getAsset } from '../../../../../lib/assets';

interface SeasonCardProps {
  season: Season;
}

export const SeasonCard: React.FC<SeasonCardProps> = ({ season }) => {
  return (
    <Grid
      size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 3 }}
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
        src={season.logoUrl || getAsset('FIRST-Logo.svg')}
        component="img"
        title={season.name}
      />
      <CardContent sx={{ textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom sx={{ direction: 'ltr' }}>
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
