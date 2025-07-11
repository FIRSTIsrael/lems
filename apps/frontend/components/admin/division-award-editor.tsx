import { useEffect, useRef, useState } from 'react';
import { WithId, ObjectId } from 'mongodb';
import { Form, Formik, FastField, FieldProps, FormikProps, FormikValues } from 'formik';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
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
import Grid from '@mui/material/Grid';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
  AwardNameTypes,
  AwardNames,
  MandatoryAwardTypes,
  OptionalAwardTypes,
  AwardSchema,
  AwardLimits,
  FllEvent
} from '@lems/types';
import { localizedAward } from '@lems/season';
import { reorder } from '@lems/utils/arrays';
import CustomNumberInput from '../field/scoresheet/number-input';
import { apiFetch } from '../../lib/utils/fetch';
import { enqueueSnackbar } from 'notistack';
import FormikCheckbox from '../general/forms/formik-checkbox';
import EventSelectorModal from '../general/event-selector-modal';
import { useTranslations } from 'next-intl';

interface AwardItemProps {
  name: AwardNames;
  index: number;
  onRemove: () => void;
}

const AwardItem: React.FC<AwardItemProps> = ({ name, index, onRemove }) => {
  const isMandatory = MandatoryAwardTypes.some(x => x === name);
  const t = useTranslations('components:admin:division-award-editor');

  return (
    <Draggable draggableId={name} index={index}>
      {provided => (
        <Grid
          container
          component={Paper}
          px={1}
          py={2}
          direction="row"
          alignItems="center"
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <Grid display="flex" alignItems="center" {...provided.dragHandleProps} size={1}>
            <DragIndicatorIcon color="disabled" />
          </Grid>
          <FastField name={`${name}`}>
            {({ field, form }: FieldProps) => (
              <Grid display="flex" alignItems="center" {...field} size={10}>
                <Grid display="flex" alignItems="center" size={2}>
                  {isMandatory ? (
                    <Tooltip title={t('mandatory-award')} arrow>
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
                <Grid size={4}>
                  <Typography>פרס {localizedAward[name].name || name}</Typography>
                </Grid>
                <Grid size={4}>
                  <CustomNumberInput
                    min={1}
                    max={AwardLimits[name] ?? 5}
                    value={field.value}
                    onChange={(e, value) => {
                      e.preventDefault();
                      if (value !== undefined) form.setFieldValue(field.name, value);
                    }}
                  />
                </Grid>
              </Grid>
            )}
          </FastField>
        </Grid>
      )}
    </Draggable>
  );
};

interface DivisionAwardEditorProps {
  divisionId: ObjectId;
  awardSchema: AwardSchema;
}

const DivisionAwardEditor: React.FC<DivisionAwardEditorProps> = ({ divisionId, awardSchema }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [awardToAdd, setAwardToAdd] = useState<AwardNames | ''>('');
  const [copyModal, setCopyModal] = useState(false);
  const [events, setEvents] = useState<Array<WithId<FllEvent>>>([]);
  const formikRef = useRef<FormikProps<FormikValues>>(null);
  const t = useTranslations('components:admin:division-award-editor');

  useEffect(() => {
    apiFetch(`/public/events`).then(res => {
      res.json().then(data => setEvents(data));
    });
  }, []);

  const getExistingAwards = (schema: AwardSchema): Array<AwardNames> => {
    const awards = Object.entries(schema).map(([key, value]) => {
      if (value.count > 0) return key;
    }) as Array<AwardNames>;

    MandatoryAwardTypes.forEach(a => {
      if (!awards.includes(a)) awards.push(a);
    });

    awards.sort((a, b) => schema[a]?.index - schema[b]?.index);
    return awards;
  };

  const [awards, setAwards] = useState<Array<AwardNames>>(getExistingAwards(awardSchema));

  const getInitialValues = (schema: AwardSchema) => {
    const values: Record<string, number | boolean> = Object.fromEntries(
      Object.entries(schema).map(([key, value]) => [key, value.count])
    );

    AwardNameTypes.forEach(a => {
      const isMandatory = MandatoryAwardTypes.some(x => x === a);
      if (!values[a]) values[a] = isMandatory ? 1 : 0;
    });

    values['enableAdvancement'] = true;
    return values;
  };

  const copyAwardsFrom = (eventId: string | ObjectId, selectedDivision?: string | ObjectId) => {
    if (selectedDivision && String(divisionId) === String(selectedDivision)) return;
    const event = events.find(e => String(e._id) === String(eventId));
    if (!event) return;
    if (!selectedDivision && event?.enableDivisions) return;
    let copyFromDivision;
    if (selectedDivision) {
      copyFromDivision = event?.divisions?.find(d => String(d._id) === String(selectedDivision));
    } else {
      copyFromDivision = event?.divisions?.[0];
    }
    if (!copyFromDivision) return;

    apiFetch(`/api/admin/divisions/${copyFromDivision._id}/awards/schema`)
      .then(res => res.json())
      .then(data => {
        if (Object.entries(data).length > 0) {
          setAwards(getExistingAwards(data));
          formikRef.current?.setValues(getInitialValues(data), true);
          enqueueSnackbar(t('copy-awards'), { variant: 'success' });
          setCopyModal(false);
        } else {
          enqueueSnackbar(t('no-awards'), { variant: 'warning' });
        }
      });
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return; // Dropped outside the list

    // The compiler thinks destination can be none despite the if statement above
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    setAwards(awards => reorder(awards, result.source.index, result.destination!.index));
  };

  return (
    <Formik
      innerRef={formikRef}
      initialValues={getInitialValues(awardSchema)}
      onSubmit={(values, actions) => {
        const schema = {} as AwardSchema;
        const { enableAdvancement, ...awardValues } = values;
        Object.entries(awardValues).forEach(([awardName, awardCount]) => {
          schema[awardName as AwardNames] = {
            count: awardCount as number,
            index: awards.findIndex(a => a === awardName)
          };
        });

        apiFetch(`/api/admin/divisions/${divisionId}/awards/schema`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(schema)
        }).then(res => {
          if (res.ok) {
            enqueueSnackbar(t('saved-awards'), { variant: 'success' });
          } else {
            enqueueSnackbar(t('error-saved-awards'), { variant: 'error' });
          }
        });

        apiFetch(`/api/admin/divisions/${divisionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enableAdvancement })
        }).then(res => {
          if (!res.ok) {
            enqueueSnackbar(t('error-update-event'), { variant: 'error' });
          }
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
          <Stack component={Paper} my={2} p={2} width="100%" direction="row" spacing={2}>
            <Button variant="contained" onClick={() => setOpen(true)} sx={{ minWidth: 120 }}>
              {t('add-optional-award')}
            </Button>
            <Button variant="contained" onClick={submitForm} sx={{ minWidth: 120 }}>
              {t('confirm')}
            </Button>
            <Button variant="contained" sx={{ minWidth: 100 }} onClick={() => setCopyModal(true)}>
              {t('copy-from-event')}
            </Button>
            <EventSelectorModal
              title={t('copy-from-event')}
              open={copyModal}
              setOpen={setCopyModal}
              events={events}
              onSelect={copyAwardsFrom}
            />
            <FormikCheckbox name="enableAdvancement" label={t('advancement-teams')} />
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
                {t('chose-optional-award')}
              </DialogContentText>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="award-select-label">{t('award')}</InputLabel>
                <Select
                  labelId="award-select-label"
                  label={t('award')}
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
                {t('cancel')}
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
                {t('confirm')}
              </Button>
            </DialogActions>
          </Dialog>
        </Form>
      )}
    </Formik>
  );
};

export default DivisionAwardEditor;
