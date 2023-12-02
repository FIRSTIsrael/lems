import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

export const handleUpdateAudienceDisplayState = async (
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

  if (eventState.audienceDisplayState === newDisplayState) {
    callback({
      ok: false,
      error: `Display state not updated!`
    });
    return;
  }

  console.log(`🖊️ Updating audience display state in event ${eventId} to ${newDisplayState}!`);

  await db.updateEventState(
    { eventId: new ObjectId(eventId) },
    { audienceDisplayState: newDisplayState }
  );

  eventState = await db.getEventState({ eventId: new ObjectId(eventId) });
  namespace.to('audience-display').emit('audienceDisplayStateUpdated', eventState);
};

export const handleUpdateAudienceDisplayMessage = async (
  namespace,
  eventId,
  newMessage,
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

  console.log(`🖊️ Updating audience display message in event ${eventId}`);

  await db.updateEventState(
    { eventId: new ObjectId(eventId) },
    { audienceDisplayMessage: newMessage }
  );

  eventState = await db.getEventState({ eventId: new ObjectId(eventId) });
  namespace.to('audience-display').emit('audienceDisplayMessageUpdated', eventState);
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
