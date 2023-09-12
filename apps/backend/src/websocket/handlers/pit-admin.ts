import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

export const handleRegisterTeam = async (namespace, eventId, teamId, callback) => {
  const team = await db.getTeam({
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

  console.log(`📝Registered team ${teamId} in event ${eventId}`);

  await db.updateTeam({ _id: team._id }, { registered: true });

  callback({ ok: true });
  namespace.to('pit-admin').emit('teamRegistered', teamId);
};
