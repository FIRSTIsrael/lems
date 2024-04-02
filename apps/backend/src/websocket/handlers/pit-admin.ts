import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

export const handleRegisterTeam = async (namespace, eventId, teamId, callback) => {
  let team = await db.getTeam({
    eventId: new ObjectId(eventId),
    _id: new ObjectId(teamId)
  });
  if (!team) {
    callback({ ok: false, error: `Could not find team ${teamId} in event ${eventId}!` });
    return;
  }
  if (team.registered) {
    callback({ ok: false, error: `Team ${teamId} is already registered!` });
    return;
  }

  console.log(`📝 Registered team ${teamId} in event ${eventId}`);

  await db.updateTeam({ _id: team._id }, { registered: true });
  team = await db.getTeam({ _id: new ObjectId(teamId) });

  callback({ ok: true });
  namespace.to('pit-admin').emit('teamRegistered', team);
};

export const handleCreateTicket = async (namespace, eventId, teamId, content, type, callback) => {
  if (teamId) {
    const team = await db.getTeam({
      eventId: new ObjectId(eventId),
      _id: new ObjectId(teamId)
    });
    if (!team) {
      callback({ ok: false, error: `Could not find team ${teamId} in event ${eventId}!` });
      return;
    }

    console.log(`🎫 Creating ticket for team ${teamId} in event ${eventId}`);
  } else {
    console.log(`🎫 Creating general ticket in event ${eventId}`);
  }

  const ticketId = await db
    .addTicket({
      eventId: new ObjectId(eventId),
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
  eventId,
  teamId,
  ticketId,
  ticketData,
  callback
) => {
  let ticket = await db.getTicket({
    eventId: new ObjectId(eventId),
    teamId: teamId ? new ObjectId(teamId) : null,
    _id: new ObjectId(ticketId)
  });
  if (!ticket) {
    callback({
      ok: false,
      error: `Could not find ticket ${ticketId} in event ${eventId}!`
    });
    return;
  }

  console.log(`🖊️ Updating ticket ${ticketId} in event ${eventId}`);

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
