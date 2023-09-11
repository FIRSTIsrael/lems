import { Filter } from 'mongodb';
import { EventState } from '@lems/types';
import db from '../database';

export const getEventState = (filter: Filter<EventState>) => {
  return db.collection<EventState>('event-states').findOne(filter);
};

export const updateEventState = (
  filter: Filter<EventState>,
  newEventState: Partial<EventState>
) => {
  return db
    .collection<EventState>('event-states')
    .updateOne(filter, { $set: newEventState }, { upsert: true });
};
