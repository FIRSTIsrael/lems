import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

export const handleCreateTicket = async (
  namespace,
  divisionId,
  teamId,
  content,
  type,
  callback
) => {
  if (teamId) {
    const team = await db.getTeam({
      divisionId: new ObjectId(divisionId),
      _id: new ObjectId(teamId)
    });
    if (!team) {
      callback({ ok: false, error: `Could not find team ${teamId} in division ${divisionId}!` });
      return;
    }

    console.log(`🎫 Creating ticket for team ${teamId} in division ${divisionId}`);
  } else {
    console.log(`🎫 Creating general ticket in division ${divisionId}`);
  }

  const ticketId = await db
    .addTicket({
      divisionId: new ObjectId(divisionId),
      teamId: teamId ? new ObjectId(teamId) : null,
      created: new Date(),
      content: content,
      type: type
    })
    .then(result => result.insertedId);

  const ticket = await db.getTicket({ _id: ticketId });

  callback({ ok: true });
  namespace.to('pit-admin').emit('ticketCreated', ticket);
};

export const handleUpdateTicket = async (
  namespace,
  divisionId,
  teamId,
  ticketId,
  ticketData,
  callback
) => {
  let ticket = await db.getTicket({
    divisionId: new ObjectId(divisionId),
    teamId: teamId ? new ObjectId(teamId) : null,
    _id: new ObjectId(ticketId)
  });
  if (!ticket) {
    callback({
      ok: false,
      error: `Could not find ticket ${ticketId} in division ${divisionId}!`
    });
    return;
  }

  console.log(`🖊️ Updating ticket ${ticketId} in division ${divisionId}`);

  await db.updateTicket(
    {
      _id: ticket._id
    },
    ticketData
  );

  callback({ ok: true });
  ticket = await db.getTicket({ _id: new ObjectId(ticketId) });
  namespace.to('pit-admin').emit('ticketUpdated', ticket);
};
