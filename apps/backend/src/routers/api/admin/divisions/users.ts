import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import asyncHandler from 'express-async-handler';
import { Parser } from '@json2csv/plainjs';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  db.getDivisionUsers(new ObjectId(req.params.divisionId)).then(users => {
    return res.json(users);
  });
});

router.get(
  '/export',
  asyncHandler(async (req: Request, res: Response) => {
    const users = await db.getDivisionUsersWithCredentials(new ObjectId(req.params.divisionId));

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

    res.set(
      'Content-Disposition',
      `attachment; filename=division_${req.params.divisionId}_passwords.csv`
    );
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
    res.send(`\ufeff${parser.parse(credentials)}`);
  })
);

router.get('/:userId', (req: Request, res: Response) => {
  db.getUser({
    _id: new ObjectId(req.params.userId),
    divisionId: new ObjectId(req.params.divisionId)
  }).then(user => {
    return res.json(user);
  });
});

export default router;
