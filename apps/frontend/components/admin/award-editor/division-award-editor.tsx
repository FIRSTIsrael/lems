import { useEffect, useRef, useState } from 'react';
import { WithId, ObjectId } from 'mongodb';
import { Form, Formik, FormikProps, FormikValues } from 'formik';
import {
  Paper,
  Stack,
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
import {
  AwardNameTypes,
  AwardNames,
  MandatoryAwardTypes,
  OptionalAwardTypes,
  AwardSchema,
  FllEvent
} from '@lems/types';
import { localizedAward } from '@lems/season';
import { apiFetch } from '../../../lib/utils/fetch';
import { enqueueSnackbar } from 'notistack';
import FormikCheckbox from '../../general/forms/formik-checkbox';
import EventSelectorModal from '../../general/event-selector-modal';
import AwardList from './award-list';

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

  useEffect(() => {
    apiFetch(`/public/events`).then(res => {
      res.json().then(data => setEvents(data));
    });
  }, []);

  const getExistingAwards = (schema: AwardSchema): Array<AwardNames> => {
    const awards = Object.entries(schema)
      .map(([key, value]) => {
        if (value.count > 0) return key;
      })
      .filter(Boolean) as Array<AwardNames>;

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

  const removeAward = (awardName: AwardNames) => {
    setAwards(awards => awards.filter(a => a !== awardName));
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
          enqueueSnackbar('הפרסים הועתקו בהצלחה!', { variant: 'success' });
          setCopyModal(false);
        } else {
          enqueueSnackbar('לאירוע שבחרתם אין פרסים', { variant: 'warning' });
        }
      });
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
            enqueueSnackbar('רשימת הפרסים נשמרה בהצלחה!', { variant: 'success' });
          } else {
            enqueueSnackbar('אופס, לא הצלחנו לשמור את רשימת הפרסים.', { variant: 'error' });
          }
        });

        apiFetch(`/api/admin/divisions/${divisionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enableAdvancement })
        }).then(res => {
          if (!res.ok) {
            enqueueSnackbar('לא הצלחנו לעדכן את פרטי האירוע.', { variant: 'error' });
          }
        });

        actions.setSubmitting(false);
      }}
    >
      {({ setFieldValue, submitForm }) => (
        <Form>
          <AwardList awards={awards} setAwards={setAwards} onRemove={removeAward} />

          <Stack component={Paper} my={2} p={2} width="100%" direction="row" spacing={2}>
            <Button variant="contained" onClick={() => setOpen(true)} sx={{ minWidth: 120 }}>
              הוספת פרס רשות
            </Button>
            <Button variant="contained" onClick={submitForm} sx={{ minWidth: 120 }}>
              שמירה
            </Button>
            <Button variant="contained" sx={{ minWidth: 100 }} onClick={() => setCopyModal(true)}>
              העתקה מאירוע אחר
            </Button>
            <EventSelectorModal
              title="העתקה מאירוע אחר"
              open={copyModal}
              setOpen={setCopyModal}
              events={events}
              onSelect={copyAwardsFrom}
            />
            <FormikCheckbox name="enableAdvancement" label="העפלת קבוצות מתחרות זו" />
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

export default DivisionAwardEditor;
