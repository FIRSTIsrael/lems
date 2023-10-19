import { useState } from 'react';
import { ObjectId } from 'mongodb';
import { Form, Formik, FastField, FieldProps } from 'formik';
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
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import {
  AwardNameTypes,
  AwardNames,
  MandatoryAwardTypes,
  OptionalAwardTypes,
  AwardSchema
} from '@lems/types';
import { localizedAward } from '@lems/season';
import { reorder } from '@lems/utils';
import CustomNumberInput from '../field/scoresheet/number-input';
import { apiFetch } from '../../lib/utils/fetch';

interface AwardItemProps {
  name: AwardNames;
  index: number;
  onRemove: () => void;
}

const AwardItem: React.FC<AwardItemProps> = ({ name, index, onRemove }) => {
  const isMandatory = MandatoryAwardTypes.some(x => x === name);

  return (
    <FastField
      name={`${name}`}
      component={({ field, form }: FieldProps) => (
        <Draggable draggableId={name} index={index} {...field}>
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
                  <IconButton
                    onClick={() => {
                      form.setFieldValue(field.name, 0);
                      onRemove();
                    }}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                )}
              </Grid>
              <Grid xs={3}>
                <Typography>פרס {localizedAward[name].name || name}</Typography>
              </Grid>
              <Grid xs={3}>
                <CustomNumberInput
                  min={1}
                  max={5}
                  value={field.value}
                  onChange={(_e, value) =>
                    value !== undefined && form.setFieldValue(field.name, value)
                  }
                />
              </Grid>
            </Grid>
          )}
        </Draggable>
      )}
    />
  );
};

interface EventAwardEditorProps {
  eventId: ObjectId;
  awardSchema: AwardSchema;
}

const EventAwardEditor: React.FC<EventAwardEditorProps> = ({ eventId, awardSchema }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [awardToAdd, setAwardToAdd] = useState<AwardNames | ''>('');

  const getExistingAwards = (schema: AwardSchema): Array<AwardNames> => {
    const awards = Object.entries(schema).map(([key, value]) => {
      if (value.count > 0) return key;
    }) as Array<AwardNames>;

    MandatoryAwardTypes.forEach(a => {
      if (!awards.includes(a)) awards.push(a);
    });

    return awards;
  };

  const [awards, setAwards] = useState<Array<AwardNames>>(getExistingAwards(awardSchema));

  const getInitialValues = (schema: AwardSchema) => {
    const values = Object.fromEntries(
      Object.entries(schema).map(([key, value]) => [key, value.count])
    );

    AwardNameTypes.forEach(a => {
      const isMandatory = MandatoryAwardTypes.some(x => x === a);
      if (!values[a]) values[a] = isMandatory ? 1 : 0;
    });

    return values;
  };

  const onDragEnd = (result: DropResult) => {
    // Dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorder(awards, result.source.index, result.destination.index);
    setAwards(items);
  };

  return (
    <Formik
      initialValues={getInitialValues(awardSchema)}
      onSubmit={(values, actions) => {
        const schema = {} as AwardSchema;
        Object.entries(values).forEach(([awardName, awardCount]) => {
          schema[awardName as AwardNames] = {
            count: awardCount,
            index: awards.findIndex(a => a === awardName)
          };
        });

        apiFetch(`/api/admin/events/${eventId}/awards/schema`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(schema)
        });

        actions.setSubmitting(false);
      }}
    >
      {({ setFieldValue, submitForm }) => (
        <Form>
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
            <Button variant="contained" onClick={submitForm} sx={{ minWidth: 150 }}>
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
              <DialogContentText id="award-dialog-description">
                בחרו פרס רשות להוסיף.
              </DialogContentText>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="award-select-label">פרס</InputLabel>
                <Select
                  labelId="award-select-label"
                  label="פרס"
                  value={awardToAdd}
                  onChange={e => {
                    setAwardToAdd(e.target.value as AwardNames);
                  }}
                >
                  {[...OptionalAwardTypes]
                    .filter(a => !awards.some(award => award === a))
                    .map(o => (
                      <MenuItem key={o} value={o}>
                        {localizedAward[o].name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(false)} autoFocus>
                ביטול
              </Button>
              <Button
                disabled={!awardToAdd}
                onClick={() => {
                  if (awardToAdd) {
                    setFieldValue(awardToAdd, 1);
                    setAwards(awards => [...awards, awardToAdd]);
                    setAwardToAdd('');
                    setOpen(false);
                  }
                }}
              >
                אישור
              </Button>
            </DialogActions>
          </Dialog>
        </Form>
      )}
    </Formik>
  );
};

export default EventAwardEditor;
