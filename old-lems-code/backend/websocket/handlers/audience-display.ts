import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

export const handleUpdateAudienceDisplay = async (
  namespace,
  divisionId,
  newDisplayState,
  callback
) => {
  let divisionState = await db.getDivisionState({ divisionId: new ObjectId(divisionId) });

  if (!divisionState) {
    callback({
      ok: false,
      error: `Could not find division state in division ${divisionId}!`
    });
    return;
  }

  console.log(`🖊️ Updating audience display state in division ${divisionId}`);

  await db.updateDivisionState(
    { divisionId: new ObjectId(divisionId) },
    { audienceDisplay: { ...divisionState.audienceDisplay, ...newDisplayState } }
  );

  divisionState = await db.getDivisionState({ divisionId: new ObjectId(divisionId) });
  namespace.to('audience-display').emit('audienceDisplayUpdated', divisionState);
};

export const handleUpdatePresentation = async (
  namespace,
  divisionId,
  presentationId,
  newPresentationState,
  callback
) => {
  let divisionState = await db.getDivisionState({ divisionId: new ObjectId(divisionId) });

  if (!divisionState) {
    callback({
      ok: false,
      error: `Could not find division state in division ${divisionId}!`
    });
    return;
  }

  if (divisionState.presentations[presentationId] === newPresentationState) {
    callback({
      ok: false,
      error: `Presentation state not updated!`
    });
    return;
  }

  console.log(`🖊️ Updating presentation ${presentationId} in division ${divisionId}!`);

  await db.updateDivisionState(
    { divisionId: new ObjectId(divisionId) },
    {
      presentations: {
        ...divisionState.presentations,
        [presentationId]: {
          ...divisionState.presentations[presentationId],
          ...newPresentationState
        }
      }
    }
  );

  divisionState = await db.getDivisionState({ divisionId: new ObjectId(divisionId) });
  namespace.to('audience-display').emit('presentationUpdated', divisionState);
};
