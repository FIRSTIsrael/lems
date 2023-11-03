import { Box, Paper, Typography } from '@mui/material';

interface TitleSlideProps {
  primary: string;
  secondary: string;
}

const TitleSlide: React.FC<TitleSlideProps> = ({ primary, secondary }) => {
  return (
    <></>
    // <Paper
    //   sx={{
    //     p: 8,
    //     textAlign: 'center',
    //     mx: '50px'
    //   }}
    // >
    //   <Typography variant="h1" fontSize="6rem" gutterBottom>
    //     {primary}
    //   </Typography>
    //   <Typography variant="h1" fontSize="4.5rem">
    //     {secondary}
    //   </Typography>
    // </Paper>
  );
};

export default TitleSlide;
