import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

export const handleUpdateAudienceDisplay = async (
  namespace,
  eventId,
  newDisplayState,
  callback
) => {
  let eventState = await db.getEventState({ eventId: new ObjectId(eventId) });

  if (!eventState) {
    callback({
      ok: false,
      error: `Could not find event state in event ${eventId}!`
    });
    return;
  }

  console.log(`🖊️ Updating audience display state in event ${eventId}`);

  await db.updateEventState(
    { eventId: new ObjectId(eventId) },
    { audienceDisplay: { ...eventState.audienceDisplay, ...newDisplayState } }
  );

  eventState = await db.getEventState({ eventId: new ObjectId(eventId) });
  namespace.to('audience-display').emit('audienceDisplayUpdated', eventState);
};

export const handleUpdatePresentation = async (
  namespace,
  eventId,
  presentationId,
  newPresentationState,
  callback
) => {
  let eventState = await db.getEventState({ eventId: new ObjectId(eventId) });

  if (!eventState) {
    callback({
      ok: false,
      error: `Could not find event state in event ${eventId}!`
    });
    return;
  }

  if (eventState.presentations[presentationId] === newPresentationState) {
    callback({
      ok: false,
      error: `Presentation state not updated!`
    });
    return;
  }

  console.log(`🖊️ Updating presentation ${presentationId} in event ${eventId}!`);

  await db.updateEventState(
    { eventId: new ObjectId(eventId) },
    {
      presentations: {
        ...eventState.presentations,
        [presentationId]: { ...eventState.presentations[presentationId], ...newPresentationState }
      }
    }
  );

  eventState = await db.getEventState({ eventId: new ObjectId(eventId) });
  namespace.to('audience-display').emit('presentationUpdated', eventState);
};
