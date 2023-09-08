import { Request, Response } from 'express';
import * as db from '@lems/database';
import { LoginPageEvent, LoginPageResponse } from '@lems/types';

const loginPageRoute = (req: Request, res: Response) => {
  db.getAllEvents()
    .then(events => {
      return Promise.all(
        events.map(async event => {
          return <LoginPageEvent>{
            rooms: await db.getEventRooms(event._id).then(rooms => {
              return rooms;
            }),
            tables: await db.getEventTables(event._id).then(tables => {
              return tables;
            }),
            ...event
          };
        })
      );
    })
    .then(loginEvents => {
      return res.json(<LoginPageResponse>loginEvents);
    });
};

export default loginPageRoute;
