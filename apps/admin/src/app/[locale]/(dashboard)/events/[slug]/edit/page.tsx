import { EditEventGrid } from './components/edit-event-grid';
import { EventInformation } from './components/event-information';
import { EditableEventTitle } from './components/editable-event-title';

export default function EditEventPage() {
  return (
    <>
      <EditableEventTitle />

      <EventInformation />

      <EditEventGrid />
    </>
  );
}
