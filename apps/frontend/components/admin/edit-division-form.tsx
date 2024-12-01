import { useState, CSSProperties } from 'react';
import { WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import { Box, Button, TextField, Typography, Stack, Paper, PaperProps } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { FllEvent, Division, DivisionSwatches } from '@lems/types';
import { apiFetch } from '../../lib/utils/fetch';
import ColorPickerButton from './color-picker-button';

interface EditDivisionFormProps extends PaperProps {
  event: WithId<FllEvent>;
  division: WithId<Division>;
}

const EditDivisionForm: React.FC<EditDivisionFormProps> = ({ event, division, ...props }) => {
  const [name, setName] = useState<string>(division.name);
  const [color, setColor] = useState<CSSProperties['color']>(division.color);

  const updateDivision = () => {
    apiFetch(`/api/admin/divisions/${division._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color })
    }).then(res => {
      if (res.ok) {
        enqueueSnackbar('פרטי הבית נשמרו בהצלחה!', { variant: 'success' });
      } else {
        enqueueSnackbar('אופס, שמירת פרטי הבית נכשלה.', { variant: 'error' });
      }
    });
  };

  return (
    <Paper sx={{ p: 4 }} {...props}>
      <Box
        component="form"
        onSubmit={e => {
          e.preventDefault();
          updateDivision();
        }}
      >
        <Stack direction="column" spacing={2}>
          <Typography variant="h2" fontSize="1.25rem" fontWeight={600}>
            פרטי הבית
          </Typography>
          <Grid container spacing={2}>
            <Grid size={6}>
              <TextField
                variant="outlined"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                label="שם בית"
                fullWidth
              />
            </Grid>
            <Grid size={6}>
              <ColorPickerButton
                swatches={DivisionSwatches}
                value={color}
                setColor={setColor}
                fullWidth
              />
            </Grid>
          </Grid>

          <Box justifyContent="center" display="flex">
            <Button type="submit" variant="contained" sx={{ minWidth: 100 }}>
              שמירה
            </Button>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
};

export default EditDivisionForm;
