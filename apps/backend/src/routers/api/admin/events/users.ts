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
  const users = await db.getEventUsersWithCredentials(new ObjectId(req.params.eventId));

  const credentials = await Promise.all(
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

  const opts = {
    fields: [
      {
        label: 'תפקיד',
        value: 'role'
      },
      {
        label: 'סוג שיוך',
        value: 'associationType'
      },
      {
        label: 'שיוך',
        value: 'association'
      },
      {
        label: 'סיסמא',
        value: 'password'
      }
    ]
  };
  const parser = new Parser(opts);
  return res.send(`\ufeff${parser.parse(credentials)}`);
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
