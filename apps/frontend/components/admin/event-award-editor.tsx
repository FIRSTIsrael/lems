import { useState } from 'react';
import { ObjectId } from 'mongodb';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import {
  Paper,
  Stack,
  Tooltip,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Autocomplete,
  TextField
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Awards, MandatoryAwardTypes, OptionalAwardTypes } from '@lems/types';
import CustomNumberInput from '../field/scoresheet/number-input';
import { localizedAward } from '@lems/season';
import { reorder } from '@lems/utils';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Grid from '@mui/material/Unstable_Grid2/Grid2';

interface AwardItemProps {
  name: Awards;
  index: number;
  onRemove: () => void;
}

const AwardItem: React.FC<AwardItemProps> = ({ name, index, onRemove }) => {
  const isMandatory = MandatoryAwardTypes.some(x => x === name);
  const [quantity, setQuantity] = useState<number>(1);

  return (
    <Draggable draggableId={name} index={index}>
      {provided => (
        <Grid
          container
          component={Paper}
          px={2}
          direction="row"
          alignItems="center"
          spacing={4}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Grid xs={1} display="flex" alignItems="center">
            <DragIndicatorIcon color="disabled" />
          </Grid>
          <Grid xs={1} display="flex" alignItems="center">
            {isMandatory ? (
              <Tooltip title="פרס חובה" arrow>
                <span>
                  <IconButton disabled>
                    <LockOutlinedIcon />
                  </IconButton>
                </span>
              </Tooltip>
            ) : (
              <IconButton onClick={onRemove}>
                <DeleteOutlineIcon />
              </IconButton>
            )}
          </Grid>
          <Grid xs={3}>
            <Typography>פרס {localizedAward[name].name || name}</Typography>
          </Grid>
          <Grid xs={3}>
            <CustomNumberInput
              value={quantity}
              onChange={(_e, value) => {
                if (value !== undefined) setQuantity(value);
              }}
              min={1}
              max={5}
            />
          </Grid>
        </Grid>
      )}
    </Draggable>
  );
};

interface EventAwardEditorProps {
  eventId: ObjectId;
}

const EventAwardEditor: React.FC<EventAwardEditorProps> = ({ eventId }) => {
  const [awards, setAwards] = useState<Array<Awards>>([...MandatoryAwardTypes]);
  const [open, setOpen] = useState<boolean>(false);
  const [awardToAdd, setAwardToAdd] = useState<Awards | null>();

  const onDragEnd = (result: DropResult) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorder(awards, result.source.index, result.destination.index);
    setAwards(items);
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {provided => (
            <Stack spacing={2} {...provided.droppableProps} ref={provided.innerRef}>
              {awards.map((award, index) => (
                <AwardItem
                  name={award}
                  index={index}
                  key={award}
                  onRemove={() => setAwards(awards => awards.filter(a => a !== award))}
                />
              ))}
              {provided.placeholder}
            </Stack>
          )}
        </Droppable>
      </DragDropContext>
      <Stack my={4} direction="row" spacing={2}>
        <Button variant="contained" onClick={() => setOpen(true)} sx={{ minWidth: 150 }}>
          הוספת פרס רשות
        </Button>
        <Button variant="contained" onClick={() => console.log('click')} sx={{ minWidth: 150 }}>
          שמירה
        </Button>
      </Stack>
      <Dialog
        open={open}
        fullWidth
        maxWidth="sm"
        onClose={() => setOpen(false)}
        aria-labelledby="award-dialog-title"
        aria-describedby="award-dialog-description"
      >
        <DialogTitle id="award-dialog-title">הוספת פרס רשות</DialogTitle>
        <DialogContent>
          <DialogContentText id="award-dialog-description">בחרו פרס רשות להוסיף</DialogContentText>
          <Autocomplete
            options={[...OptionalAwardTypes].filter(a => !awards.some(award => award === a))}
            getOptionLabel={o => localizedAward[o].name}
            renderInput={params => <TextField {...params} label="שם הפרס" />}
            sx={{ mt: 2 }}
            value={awardToAdd}
            onChange={(_e, newValue) => {
              setAwardToAdd(newValue);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} autoFocus>
            ביטול
          </Button>
          <Button
            disabled={!awardToAdd}
            onClick={() => {
              if (awardToAdd) {
                setAwards(awards => [...awards, awardToAdd]);
                setAwardToAdd(null);
                setOpen(false);
              }
            }}
          >
            אישור
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EventAwardEditor;
