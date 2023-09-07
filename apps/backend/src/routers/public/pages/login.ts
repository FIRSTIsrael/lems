import { Request, Response } from 'express';
import { getAllEvents, getEventRooms, getEventTables } from '@lems/database';
import { LoginPageEvent, LoginPageResponse } from '@lems/types';

const loginPageRoute = (req: Request, res: Response) => {
  getAllEvents()
    .then(events => {
      return Promise.all(
        events.map(async event => {
          return <LoginPageEvent>{
            rooms: await getEventRooms(event._id).then(rooms => {
              return rooms;
            }),
            tables: await getEventTables(event._id).then(tables => {
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
