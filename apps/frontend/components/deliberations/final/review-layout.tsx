import Grid from '@mui/material/Unstable_Grid2';
import { Award } from '@lems/types';

interface ReviewLayoutProps {
  awards: Array<Award>;
}

const ReviewLayout: React.FC<ReviewLayoutProps> = ({ awards }) => {
  return (
    <Grid container pt={2} columnSpacing={4} rowSpacing={2}>
      <Grid xs={2}>
        <p>Award</p>
      </Grid>
      <Grid xs={2}>
        <p>Award</p>
      </Grid>
      <Grid xs={2}>
        <p>Award</p>
      </Grid>
      <Grid xs={2}>
        <p>Award</p>
      </Grid>
      <Grid xs={2}>
        <p>Award</p>
      </Grid>
      <Grid xs={2}>
        <p>Award</p>
      </Grid>
    </Grid>
  );
};

export default ReviewLayout;
