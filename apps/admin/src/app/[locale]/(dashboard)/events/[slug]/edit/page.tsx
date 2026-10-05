import { Box } from '@mui/material';
import { EditEventGrid } from './components/edit-event-grid';
import { EventInformation } from './components/event-information';
import { EditableEventTitle } from './components/editable-event-title';
import { EventLocationEditor } from './components/event-location-editor';

export default function EditEventPage() {
  return (
    <>
      <EditableEventTitle />

      <EventInformation />

      <EditEventGrid />

      <Box sx={{ mt: 3 }}>
        <EventLocationEditor />
      </Box>
    </>
  );
}
