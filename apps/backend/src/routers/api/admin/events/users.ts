import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { Parser } from '@json2csv/plainjs';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  db.getEventUsers(new ObjectId(req.params.eventId)).then(users => {
    return res.json(users);
  });
});

router.get('/export', async (req: Request, res: Response) => {
  console.log(req.params.eventId);
  const users = await db.getEventUsers(new ObjectId(req.params.eventId));

  const data = await Promise.all(
    users.map(async user => {
      const { role, roleAssociation, password } = user;

      let association;
      if (roleAssociation) {
        switch (roleAssociation.type) {
          case 'room':
            association = (await db.getRoom({ _id: new ObjectId(roleAssociation.value) })).name;
            break;
          case 'table':
            association = (await db.getTable({ _id: new ObjectId(roleAssociation.value) })).name;
            break;
          default:
            association = roleAssociation.value;
            break;
        }
      }

      return {
        role,
        associationType: roleAssociation?.type,
        association,
        password
      };
    })
  );

  res.set('Content-Disposition', `attachment; filename=event_${req.params.eventId}_passwords.csv`);
  res.set('Content-Type', 'text/csv');

  if (data.length > 0) {
    return res.send(`\ufeff${new Parser().parse(data)}`);
  } else {
    return res.send('');
  }
});

router.get('/:userId', (req: Request, res: Response) => {
  db.getUser({
    _id: new ObjectId(req.params.userId),
    eventId: new ObjectId(req.params.eventId)
  }).then(user => {
    return res.json(user);
  });
});

export default router;
