import { Box, Paper, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/';
import { Field, FieldProps } from 'formik';

interface GpSelectorPros {
  prop: any;
}

const GpSelector: React.FC<GpSelectorPros> = ({ missionIndex, mission, src }) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Field>
        <Typography>Gp goes here</Typography>
      </Field>
    </Paper>
  );
};

export default GpSelector;
