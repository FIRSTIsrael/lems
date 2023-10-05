import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

export const handleRegisterTeam = async (namespace, eventId, teamId, callback) => {
  let team = await db.getTeam({
    event: new ObjectId(eventId),
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
  const team = await db.getTeam({
    event: new ObjectId(eventId),
    _id: new ObjectId(teamId)
  });
  if (!team) {
    callback({ ok: false, error: `Could not find team ${teamId} in event ${eventId}!` });
    return;
  }

  console.log(`🎫 Creating ticket for team ${teamId} in event ${eventId}`);

  const ticketId = await db
    .addTicket({
      event: new ObjectId(eventId),
      team: new ObjectId(teamId),
      created: new Date(),
      status: 'not-started',
      content: content,
      type: type
    })
    .then(result => result.insertedId);

  const ticket = db.getTicket({ _id: ticketId });

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
    event: new ObjectId(eventId),
    team: new ObjectId(teamId),
    _id: new ObjectId(ticketId)
  });
  if (!ticket) {
    callback({
      ok: false,
      error: `Could not find ticket ${ticketId} for team ${teamId} in event ${eventId}!`
    });
    return;
  }

  console.log(`🖊️ Updating ticket ${ticketId} for team ${teamId} in event ${eventId}`);

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
