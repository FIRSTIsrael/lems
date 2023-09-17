import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

export const handleMatchStatusChange = async (namespace, matchId, ready, callback) => {
  const match = await db.getMatch({
    _id: new ObjectId(matchId)
  });
  if (!match) {
    callback({
      ok: false,
      error: `Could not find match ${matchId}!`
    });
    return;
  }

  console.log(`🖊️ Updating status of match ${matchId}`);

  await db.updateMatch(
    {
      _id: match._id
    },
    { ready }
  );

  callback({ ok: true });
  namespace.to('field').emit('matchStatusChanged', match._id);
};
