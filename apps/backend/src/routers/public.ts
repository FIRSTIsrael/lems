import express, { NextFunction, Request, Response } from 'express';
import { getAllEvents, getEventRooms, getEventTables } from '@lems/database';
import { ObjectId } from 'mongodb';
import { LoginPageEvent } from '@lems/types';

const publicRouter = express.Router({ mergeParams: true });

publicRouter.get('/pages/login', (req: Request, res: Response) => {
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
      return res.json(loginEvents);
    });
});

export default publicRouter;
